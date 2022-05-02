import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import {
  makeAmbientLight,
  makeStandardMaterial,
  makeDirectionalLight,
  makeEdgeMaterial,
  makeLambertMaterial,
  makeNormalMaterial,
  makeTexture,
  stl2png,
} from '../src/index';

describe(stl2png.name, function () {
  this.timeout(60000);

  const files = ['Cube_3d_printing_sample.stl', 'ScaleNC.stl', 'Stanford_Bunny_sample.stl', 'Eiffel_tower_sample.stl', 'Sphere.stl'];

  files.forEach((filename) =>
    describe('default', function () {
      it(`for '${filename}'`, async () => {
        const stlData = await fs.promises.readFile(path.join(__dirname, 'data', filename));
        const png = stl2png(stlData);
        await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `${this.title}_${filename}.png`), png);
        await compareImages(`${this.title}_${filename}`);
      });
    })
  );

  files.forEach((filename) =>
    describe('noOverDraw', function () {
      it(`for '${filename}'`, async () => {
        const stlData = await fs.promises.readFile(path.join(__dirname, 'data', filename));
        const material = makeStandardMaterial(0.7, 0x3097d1);
        material.overDraw = 0;
        const png = stl2png(stlData, { materials: [material], edgeMaterials: [] });
        await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `${this.title}_${filename}.png`), png);
        await compareImages(`${this.title}_${filename}`);
      });
    })
  );

  files.forEach((filename) =>
    describe('withEnvMap', function () {
      it(`for '${filename}'`, async () => {
        const stlData = await fs.promises.readFile(path.join(__dirname, 'data', filename));
        const metal = await fs.promises.readFile(path.join(__dirname, 'data', 'textures', 'metal.jpg'));
        const png = stl2png(stlData, {
          materials: [makeLambertMaterial(0.2, makeTexture(metal, false)), makeStandardMaterial(0.7, 0x3097d1)],
          edgeMaterials: [makeEdgeMaterial(0.3, 0x287dad)],
        });
        await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `${this.title}_${filename}.png`), png);
        await compareImages(`${this.title}_${filename}`);
      });
    })
  );

  files.forEach((filename) =>
    describe('wireframe', function () {
      it(`for '${filename}'`, async () => {
        const stlData = await fs.promises.readFile(path.join(__dirname, 'data', filename));
        const png = stl2png(stlData, {
          lights: [makeAmbientLight(0xffffff), makeDirectionalLight(1, 1, 1, 0xffffff, 1.35), makeDirectionalLight(0.5, 1, -1, 0xffffff, 1)],
          materials: [makeStandardMaterial(0.5, 0xffffff)],
          edgeMaterials: [makeEdgeMaterial(3, 0x014776)],
        });
        await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `${this.title}_${filename}.png`), png);
        await compareImages(`${this.title}_${filename}`);
      });
    })
  );

  files.forEach((filename) =>
    describe('normals', function () {
      it(`for '${filename}'`, async () => {
        const stlData = await fs.promises.readFile(path.join(__dirname, 'data', filename));
        const png = stl2png(stlData, {
          materials: [makeLambertMaterial(0.2), makeStandardMaterial(1, 0x96a7b9), makeNormalMaterial(0.4)],
          edgeMaterials: [makeEdgeMaterial(0.5, 0x242c44)],
        });
        await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `${this.title}_${filename}.png`), png);
        await compareImages(`${this.title}_${filename}`);
      });
    })
  );
});

async function compareImages(outFileName: string) {
  const expected = PNG.sync.read(await fs.promises.readFile(path.join(__dirname, 'data', 'ref', `${outFileName}.png`)));
  const actual = PNG.sync.read(await fs.promises.readFile(path.join(__dirname, 'data', 'dump', `${outFileName}.png`)));
  const diff = new PNG({ width: expected.width, height: expected.height });
  const differentPixels = pixelmatch(actual.data, expected.data, diff.data, expected.width, expected.height);
  if (differentPixels) {
    await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `${outFileName}.diff.png`), PNG.sync.write(diff));
  }
  expect(differentPixels).to.eql(0);
}
