import * as THREE from 'three';
import Canvas from 'canvas';

import { CanvasRenderer } from './threejs-extras/CanvasRenderer';
import { STLLoader } from './threejs-extras/STLLoader';

const DEFAULTS = {
  width: 768,
  height: 512,
  backgroundColor: 0xffffff,
  backgroundAlpha: 0,
  cameraPosition: [0, -25, 20],
  materials: [makeStandardMaterial(1, 0xb8cad8)],
  edgeMaterials: [],
  lights: [makeDirectionalLight(0, -25, 100, 0xffffff, 1.5), makeAmbientLight(0x666666)],
};

export interface Options {
  width?: number;
  height?: number;
  backgroundColor?: number;
  backgroundAlpha?: number;
  cameraPosition?: [number, number, number];
  lights?: THREE.Light[];
  materials?: THREE.Material[];
  edgeMaterials?: THREE.Material[];
}

function getGeometry(stlData: Buffer): THREE.BufferGeometry {
  const loader = new STLLoader();
  const geometry = loader.parse(stlData);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  geometry.center();
  return geometry;
}

export function stl2png(stlData: Buffer, options: Options = {}): Buffer {
  // Prepare the scene, renderer, and camera
  const width = options.width ?? DEFAULTS.width;
  const height = options.height ?? DEFAULTS.height;
  const backgroundColor = options.backgroundColor ?? DEFAULTS.backgroundColor;
  const backgroundAlpha = options.backgroundAlpha ?? DEFAULTS.backgroundAlpha;
  const camera = new THREE.PerspectiveCamera(30, width / height, 1, 1000);
  const scene = new THREE.Scene();
  const renderer = new CanvasRenderer({ createCanvas: () => Canvas.createCanvas(width, height), alpha: !backgroundAlpha });
  renderer.setSize(width, height, false);
  renderer.setClearColor(backgroundColor, backgroundAlpha);
  const geometry = getGeometry(stlData);

  // Configure camera with user-set position, then move it in-or-out depending on
  // the size of the model that needs to display
  camera.position.x = options.cameraPosition?.[0] ?? DEFAULTS.cameraPosition[0];
  camera.position.y = options.cameraPosition?.[1] ?? DEFAULTS.cameraPosition[1];
  camera.position.z = options.cameraPosition?.[2] ?? DEFAULTS.cameraPosition[2];
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // (re)Position the camera
  // See http://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object
  const fov = camera.fov * (Math.PI / 180);
  const distance = Math.abs(geometry.boundingSphere.radius / Math.sin(fov / 2));
  const newPosition = camera.position.clone().normalize().multiplyScalar(distance);
  camera.position.set(newPosition.x, newPosition.y, newPosition.z);
  camera.updateProjectionMatrix();

  (options.lights ?? DEFAULTS.lights).forEach((light) => scene.add(light));

  // Get materials according to requested characteristics of the output render
  (options.materials ?? DEFAULTS.materials).forEach((m) => scene.add(new THREE.Mesh(geometry, m)));
  if (!options.edgeMaterials || options.edgeMaterials.length) {
    const edges = new THREE.EdgesGeometry(geometry);
    (options.edgeMaterials ?? DEFAULTS.edgeMaterials).forEach((m) => scene.add(new THREE.LineSegments(edges, m)));
  }

  renderer.render(scene, camera);
  return renderer.domElement.toBuffer();
}

export function makeTexture(imageData: string | Buffer, hasAlpha: boolean, mapping?: THREE.Mapping): THREE.Texture {
  const img = new Canvas.Image();
  img.src = imageData;

  const texture = new THREE.Texture();
  texture.format = hasAlpha ? THREE.RGBFormat : THREE.RGBAFormat;
  texture.image = img;
  texture.needsUpdate = true;
  if (mapping) texture.mapping = mapping;
  return texture;
}

export function makeLambertMaterial(opacity: number, envMap: THREE.Texture | null = null): THREE.MeshLambertMaterial {
  return makeCanvasMaterial(
    new THREE.MeshLambertMaterial({
      envMap: envMap,
      transparent: true,
      side: THREE.DoubleSide,
      opacity: opacity,
    }),
    0
  );
}

export function makeCanvasMaterial<T extends THREE.Material>(material: T, overDraw: number): T & { overDraw?: number } {
  (material as T & { overDraw?: number }).overDraw = overDraw;
  return material;
}

export function makeStandardMaterial(opacity: number, color: number): THREE.MeshStandardMaterial & { overDraw?: number } {
  return makeCanvasMaterial(
    new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: opacity,
      color: color,
    }),
    0.55
  );
}

export function makeNormalMaterial(opacity: number): THREE.MeshNormalMaterial & { overDraw?: number } {
  return makeCanvasMaterial(
    new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: opacity,
    }),
    0.2
  );
}

export function makeEdgeMaterial(weight: number, color: number): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: color,
    linewidth: weight,
    linecap: 'round',
    linejoin: 'round',
  });
}

export function makeAmbientLight(color: number, intensity?: number): THREE.AmbientLight {
  return new THREE.AmbientLight(color, intensity);
}

export function makeDirectionalLight(x: number, y: number, z: number, color?: number, intensity?: number): THREE.DirectionalLight {
  const directionalLight = new THREE.DirectionalLight(color, intensity);
  directionalLight.position.set(x, y, z);

  directionalLight.castShadow = true;

  const d = 1;
  directionalLight.shadow.camera.left = -d;
  directionalLight.shadow.camera.right = d;
  directionalLight.shadow.camera.top = d;
  directionalLight.shadow.camera.bottom = -d;

  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 4;

  directionalLight.shadow.bias = -0.002;
  return directionalLight;
}
