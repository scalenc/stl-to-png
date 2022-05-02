import {
  makeAmbientLight,
  makeBasicMaterial,
  makeDirectionalLight,
  makeEdgeMaterial,
  makeLambertMaterial,
  makeNormalMaterial,
  makeTexture,
  stl2png,
} from '../src/index';
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';

describe(stl2png.name, function () {
  this.timeout(60000);

  const files = ['Cube_3d_printing_sample.stl', 'ScaleNC.stl', 'Stanford_Bunny_sample.stl', 'Eiffel_tower_sample.stl', 'Sphere.stl'];

  files.forEach((filename) =>
    describe('default', () => {
      it(`for '${filename}'`, async () => {
        const stlData = await fs.promises.readFile(path.join(__dirname, 'data', filename));
        const png = await stl2png(stlData);
        await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `default_${filename}.png`), png);
        const expected = await fs.promises.readFile(path.join(__dirname, 'data', 'ref', `default_${filename}.png`));
        expect(png).deep.eq(expected);
      });
    })
  );

  files.forEach((filename) =>
    describe('noOverDraw', () => {
      it(`for '${filename}'`, async () => {
        const stlData = await fs.promises.readFile(path.join(__dirname, 'data', filename));
        const material = makeBasicMaterial(0.7, 0x3097d1);
        material.overDraw = 0;
        const png = await stl2png(stlData, {
          materials: [material],
          edgeMaterials: [],
        });
        await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `noOverDraw_${filename}.png`), png);
        const expected = await fs.promises.readFile(path.join(__dirname, 'data', 'ref', `noOverDraw_${filename}.png`));
        expect(png).deep.eq(expected);
      });
    })
  );

  files.forEach((filename) =>
    describe('style-1', () => {
      it(`for '${filename}'`, async () => {
        const stlData = await fs.promises.readFile(path.join(__dirname, 'data', filename));
        const metal = await fs.promises.readFile(path.join(__dirname, 'data', 'textures', 'metal.jpg'));
        const png = await stl2png(stlData, {
          materials: [makeLambertMaterial(0.2, makeTexture(metal, false)), makeBasicMaterial(0.7, 0x3097d1)],
          edgeMaterials: [makeEdgeMaterial(0.3, 0x287dad)],
        });
        await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `style-1_${filename}.png`), png);
        const expected = await fs.promises.readFile(path.join(__dirname, 'data', 'ref', `style-1_${filename}.png`));
        expect(png).deep.eq(expected);
      });
    })
  );

  files.forEach((filename) =>
    describe('style-2', () => {
      it(`for '${filename}'`, async () => {
        const stlData = await fs.promises.readFile(path.join(__dirname, 'data', filename));
        const png = await stl2png(stlData, {
          lights: [makeAmbientLight(0xffffff), makeDirectionalLight(1, 1, 1, 0xffffff, 1.35), makeDirectionalLight(0.5, 1, -1, 0xffffff, 1)],
          materials: [makeBasicMaterial(0.7, 0xffffff)],
          edgeMaterials: [makeEdgeMaterial(0.7, 0x000000)], // optional: major edges will appear more boldly than minor edges
        });
        await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `style-2_${filename}.png`), png);
        const expected = await fs.promises.readFile(path.join(__dirname, 'data', 'ref', `style-2_${filename}.png`));
        expect(png).deep.eq(expected);
      });
    })
  );

  files.forEach((filename) =>
    describe('normals', () => {
      it(`for '${filename}'`, async () => {
        const stlData = await fs.promises.readFile(path.join(__dirname, 'data', filename));
        // const metal = await fs.promises.readFile(path.join(__dirname, 'data', 'textures', 'metal.jpg'));
        const png = await stl2png(stlData, {
          materials: [makeLambertMaterial(0.2), makeBasicMaterial(1, 0x96a7b9), makeNormalMaterial(0.4)],
          edgeMaterials: [makeEdgeMaterial(0.5, 0x242c44)],
        });
        await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `normals_${filename}.png`), png);
        const expected = await fs.promises.readFile(path.join(__dirname, 'data', 'ref', `normals_${filename}.png`));
        expect(png).deep.eq(expected);
      });
    })
  );
});
