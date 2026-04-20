import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import imageminWebp from 'imagemin-webp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';

async function compressImages() {
  const srcRoot = path.resolve('src/images');
  const outRoot = path.resolve('images');

  const imageFiles = await glob('src/images/**/*.{jpg,jpeg,png,gif,svg,webp}', {
    absolute: true,
    nodir: true
  });

  console.log(`Found ${imageFiles.length} images to compress...`);

  let processed = 0;
  let skipped = 0;

  for (const file of imageFiles) {
    const ext = path.extname(file).toLowerCase();
    const relPath = path.relative(srcRoot, file);
    const outFile = path.join(outRoot, relPath);
    const outDir = path.dirname(outFile);

    const shouldGenerateWebp = ext === '.jpg' || ext === '.jpeg' || ext === '.png';
    const outWebp = shouldGenerateWebp
      ? path.join(outDir, `${path.basename(outFile, ext)}.webp`)
      : null;

    const srcStat = await fs.stat(file);

    const outStat = await fs.stat(outFile).catch(() => null);
    const outWebpStat = outWebp ? await fs.stat(outWebp).catch(() => null) : null;

    const isUpToDate =
      outStat &&
      outStat.mtimeMs >= srcStat.mtimeMs &&
      (!outWebp || (outWebpStat && outWebpStat.mtimeMs >= srcStat.mtimeMs));

    if (isUpToDate) {
      skipped += 1;
      continue;
    }

    await fs.mkdir(outDir, { recursive: true });

    if (ext === '.jpg' || ext === '.jpeg') {
      await imagemin([file], {
        destination: outDir,
        plugins: [imageminMozjpeg({ quality: 80 })]
      });
    } else if (ext === '.png') {
      await imagemin([file], {
        destination: outDir,
        plugins: [imageminPngquant({ quality: [0.65, 0.9] })]
      });
    } else if (ext === '.gif') {
      await fs.copyFile(file, outFile);
    } else if (ext === '.svg') {
      await imagemin([file], {
        destination: outDir,
        plugins: [
          imageminSvgo({
            plugins: [{ name: 'removeViewBox', active: false }]
          })
        ]
      });
    } else if (ext === '.webp') {
      await imagemin([file], {
        destination: outDir,
        plugins: [imageminWebp({ quality: 80 })]
      });
    }

    if (shouldGenerateWebp) {
      await imagemin([file], {
        destination: outDir,
        plugins: [imageminWebp({ quality: 80 })]
      });
    }

    processed += 1;
  }

  console.log(`✓ Image compression complete! (processed: ${processed}, skipped: ${skipped})`);
}

compressImages().catch(error => {
  console.error('Error compressing images:', error);
  process.exit(1);
});
