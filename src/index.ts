import * as THREE from 'three';
import Canvas from 'canvas';

// Assign this to global so that the subsequent modules can extend it:
import { CanvasRenderer } from './threejs-extras/CanvasRenderer';
import { STLLoader } from './threejs-extras/STLLoader';

const DEFAULTS = {
  width: 500,
  height: 500,
  cameraAngle: [10, 50, 100], // optional: specify the angle of the view for thumbnailing. This is the camera's position vector, the opposite of the direction the camera is looking.
  lights: [makeAmbientLight(0xffffff), makeDirectionalLight(1, 1, 1, 0xffffff, 1.35), makeDirectionalLight(0.5, 1, -1, 0xffffff, 1)],
  materials: [makeBasicMaterial(0.7, 0xffffff)],
  edgeMaterials: [makeEdgeMaterial(0.7, 0x000000)], // optional: major edges will appear more boldly than minor edges
};

export interface Options {
  width?: number;
  height?: number;
  cameraAngle?: [number, number, number]; // optional: specify the angle of the view for thumbnailing. This is the camera's position vector, the opposite of the direction the camera is looking.
  lights?: THREE.Light[];
  materials?: THREE.Material[]; // optional: material used to render faces
  edgeMaterials?: THREE.Material[]; // optional: material used to render lines
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

export async function stl2png(stlData: Buffer, options: Options = {}): Promise<Buffer> {
  // Prepare the scene, renderer, and camera
  const width = options.width ?? DEFAULTS.width;
  const height = options.height ?? DEFAULTS.height;
  const camera = new THREE.PerspectiveCamera(30, width / height, 1, 1000);
  const scene = new THREE.Scene();
  const renderer = new CanvasRenderer({ createCanvas: () => Canvas.createCanvas(width, height) });
  const geometry = getGeometry(stlData);

  // Configure renderer
  renderer.setSize(width, height, false);
  renderer.setClearColor(0xffffff, 1);
  THREE.Sprite;

  // Configure camera with user-set position, then move it in-or-out depending on
  // the size of the model that needs to display
  camera.position.x = options.cameraAngle?.[0] ?? DEFAULTS.cameraAngle[0];
  camera.position.y = options.cameraAngle?.[1] ?? DEFAULTS.cameraAngle[1];
  camera.position.z = options.cameraAngle?.[2] ?? DEFAULTS.cameraAngle[2];
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // (re)Position the camera
  // See http://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object
  const fov = camera.fov * (Math.PI / 180);
  const distance = Math.abs(geometry.boundingSphere.radius / Math.sin(fov / 2));
  const newPosition = camera.position.clone().normalize().multiplyScalar(distance);
  camera.position.set(newPosition.x, newPosition.y, newPosition.z);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (camera as any).needsUpdate = true; // FIXME really necessary?
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

export function makeLambertMaterial(opacity: number, envMap: THREE.Texture): THREE.MeshLambertMaterial {
  return makeCanvasMaterial(
    new THREE.MeshLambertMaterial({
      envMap: envMap,
      transparent: true,
      side: THREE.DoubleSide,
      opacity: opacity,
    }),
    0.5
  );
}

export function makeCanvasMaterial<T extends THREE.Material>(material: T, overDraw: number): T & { overDraw?: number } {
  (material as T & { overDraw?: number }).overDraw = overDraw;
  return material;
}

export function makeBasicMaterial(opacity: number, color: number): THREE.MeshBasicMaterial & { overDraw?: number } {
  return makeCanvasMaterial(
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: opacity,
      color: color,
    }),
    0.1
  );
}

// faces will be shaded lightly by their normal direction
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
