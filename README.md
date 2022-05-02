# stl-to-png

Create PNG images from 3D STL files.
Creates beautifully rendered PNG output server-side with no GPU from ASCII and Binary STL's.

> This code is forked from [`node-stl-to-thumbnail`](https://www.npmjs.com/package/node-stl-to-thumbnail) which is a fork from [`node-stl-thumbnailer`](https://www.npmjs.com/package/node-stl-thumbnailer) by instructables. This fork adds typescript support and unit tests.

## Installation

To install the this package, simply use your favorite package manager:

```sh
npm install stl-to-png
yarn add stl-to-png
pnpm add stl-to-png
```

## Usage

The following snippet loads a file from the current directory (`./input.stl`), and creates a 500x500 PNG image in the current directory called `./output.png`.

```typescript
import { stl2png } from 'stl-to-png';
import fs from 'fs';
import path from 'path';

const stlData = fs.readFileSync(path.join(__dirname, 'input.stl'));
const pngData = stl2png(stlData, { width: 500, height: 500 });
fs.writeFileSync(path.join(__dirname, 'output.png'), pngData);
```

The following snippet adds some more styling to the previous example assuming a texture image `metal.jpg` in the current directory.

```typescript
import { makeStandardMaterial, makeEdgeMaterial, makeLambertMaterial, makeTexture, stl2png } from 'stl-to-png';
import fs from 'fs';
import path from 'path';

const stlData = fs.readFileSync(path.join(__dirname, 'input.stl'));
const metal = fs.readFileSync(path.join(__dirname, 'metal.jpg'));
const pngData = stl2png(stlData, {
  materials: [makeLambertMaterial(0.2, makeTexture(metal, false)), makeStandardMaterial(0.7, 0x3097d1)],
  edgeMaterials: [makeEdgeMaterial(0.1, 0x287dad)],
});
fs.writeFileSync(path.join(__dirname, `output.png`), pngData);
```

## Development

```shell
# build the code
yarn build

# unit tests
yarn test
```

### CI

All branches are built and tested using Gitlab CI.
Changes on the master branch will be deployed to npm.js

## License

---

MIT
