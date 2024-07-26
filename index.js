const sharp = require('sharp');
const fs = require('fs');

// iterate over the images in the folder

// Directory to the input image
const inputDirectory = './input';
// Directory to the output image
const outputDirectory = './output';

async function main() {
  const assets = await readFiles();
  for (const subDir of Object.keys(assets)) {
    if (!fs.existsSync(`${outputDirectory}/${subDir}`)) {
      fs.mkdirSync(`${outputDirectory}/${subDir}`);
    }
    if (!fs.existsSync(`${outputDirectory}/${subDir}flippedAnimation`)) {
      fs.mkdirSync(`${outputDirectory}/${subDir}/flippedAnimation`);
    }
    for (const file of assets[subDir]) {
      const inputPath = `${inputDirectory}/${subDir}/${file}`;
      const splitFile = file.split('_');
      const frameRate = splitFile[0];

      const outputPath = `${outputDirectory}/${subDir}/flippedAnimation/${splitFile[1]}`;

      await flopImage(inputPath, outputPath, frameRate);
    }
  }
}

// Read the files in the input directory
async function readFiles() {
  const paths = {};
  const subDirectories = await fs
    .readdirSync(inputDirectory)
    .filter(async (file) => {
      const isDir = await isDirectory(`${inputDirectory}/${file}`);
      if (isDir) {
        return true;
      }
      return false;
    });

  for (const subDir of subDirectories) {
    paths[subDir] = [];
    const files = await fs.readdirSync(`${inputDirectory}/${subDir}`);
    for (const file of files) {
      const path = `${subDir}/${file}`;
      const isPNGFile = await checkFile(`${inputDirectory}/${path}`);
      if (isPNGFile) {
        paths[subDir].push(file);
      }
    }
  }
  return paths;
}

async function isDirectory(path) {
  return fs.lstatSync(path).isDirectory();
}

async function checkFile(path) {
  return fs.lstatSync(path).isFile() && path.endsWith('.png');
}

// Load the image
async function flopImage(inputPath, outputPath, frameRate) {
  sharp(inputPath)
    .metadata()
    .then((metadata) => {
      const width = metadata.width;
      const height = metadata.height;
      const sectionWidth = Math.floor(width / frameRate);

      const sections = [];
      for (let i = 0; i < frameRate; i++) {
        sections.push(
          sharp(inputPath)
            .extract({
              left: i * sectionWidth,
              top: 0,
              width: sectionWidth,
              height: height,
            })
            .flop()
            .toBuffer()
        );
      }

      return Promise.all(sections).then((buffers) => ({
        buffers,
        height,
        sectionWidth,
      }));
    })
    .then(({ buffers, height, sectionWidth }) => {
      const images = buffers.map((buffer, index) => ({
        input: buffer,
        left: index * sectionWidth,
        top: 0,
      }));

      return sharp({
        create: {
          width: sectionWidth * frameRate,
          height: height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite(images)
        .flop()
        .toFile(outputPath);
    })
    .then(() => {
      console.log('Image rearranged and saved successfully.');
    })
    .catch((err) => {
      console.error('Error:', err);
    });
}

main();
