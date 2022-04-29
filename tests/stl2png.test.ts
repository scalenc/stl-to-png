import { makeBasicMaterial, makeEdgeMaterial, makeLambertMaterial, makeNormalMaterial, makeTexture, stl2png } from '../src/index';
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';

describe(stl2png.name, function () {
  this.timeout(20000);

  const files = ['input.stl'];

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
    describe('styled', () => {
      it(`for '${filename}'`, async () => {
        const stlData = await fs.promises.readFile(path.join(__dirname, 'data', filename));
        const metal = await fs.promises.readFile(path.join(__dirname, 'data', 'textures', 'metal.jpg'));
        const png = await stl2png(stlData, {
          materials: [makeLambertMaterial(0.2, makeTexture(metal, false)), makeBasicMaterial(0.7, 0x3097d1)],
          edgeMaterials: [makeEdgeMaterial(0.1, 0x287dad)],
        });
        await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `styled_${filename}.png`), png);
        const expected = await fs.promises.readFile(path.join(__dirname, 'data', 'ref', `styled_${filename}.png`));
        expect(png).deep.eq(expected);
      });
    })
  );

  files.forEach((filename) =>
    describe('withNormals', () => {
      it(`for '${filename}'`, async () => {
        const stlData = await fs.promises.readFile(path.join(__dirname, 'data', filename));
        const metal = await fs.promises.readFile(path.join(__dirname, 'data', 'textures', 'metal.jpg'));
        const png = await stl2png(stlData, {
          materials: [makeLambertMaterial(0.2, makeTexture(metal, false)), makeNormalMaterial(0.4)],
          edgeMaterials: [makeEdgeMaterial(0.1, 0x287dad)],
        });
        await fs.promises.writeFile(path.join(__dirname, 'data', 'dump', `withNormals_${filename}.png`), png);
        const expected = await fs.promises.readFile(path.join(__dirname, 'data', 'ref', `withNormals_${filename}.png`));
        expect(png).deep.eq(expected);
      });
    })
  );
});
