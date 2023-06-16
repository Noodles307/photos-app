import SVGO from 'svgo';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const iconsDir = join(process.cwd(), 'src', 'assets', 'icons');

function optimizeSVG() {
  const config = {
    plugins: [
      {
        mergePaths: {
          noSpaceAfterFlags: false,
        },
      },
      {
        convertPathData: {
          noSpaceAfterFlags: false,
        },
      },
      {
        convertColors: true,
      },
    ],
  };
  const optimizer = new SVGO(config);
  const files = readdirSync(iconsDir).filter((file) => file.indexOf('.svg') !== -1);
  files.forEach((file) => {
    const iconFilePath = join(iconsDir, file);
    const fileData = readFileSync(iconFilePath);
    const output = optimizer.optimize(fileData);
    output.then((out) => {
      writeFileSync(iconFilePath, out.data);
    });
  });
}

optimizeSVG();
