import sharp from 'sharp';
import path from 'path';

const src = path.join(process.cwd(), 'public', 'spkt-logo.png');
const dst = path.join(process.cwd(), 'public', 'spkt-emblem.png');

/** Ruang hitam di bawah ujung perisai sebelum teks SPKT */
const BOTTOM_PADDING = 21;

async function detectCropHeight(width, height, data, channels) {
  let inGap = false;
  let gapStart = 0;
  let lastContent = 0;

  for (let y = 100; y < height; y++) {
    let total = 0;
    let center = 0;

    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const bright = Math.max(data[i], data[i + 1], data[i + 2]);
      if (data[i + 3] > 10 && bright > 15) {
        total++;
        if (x > 180 && x < 360) {
          center++;
        }
      }
    }

    if (total < 8) {
      if (!inGap) {
        inGap = true;
        gapStart = y;
      }
    } else if (inGap && total > 200) {
      return Math.min(gapStart + BOTTOM_PADDING, y - 1);
    } else if (!inGap && center > 10) {
      lastContent = y;
    } else if (total >= 8) {
      inGap = false;
    }
  }

  return lastContent + BOTTOM_PADDING;
}

async function main() {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = info.width ?? 538;
  const height = info.height ?? 511;
  const cropHeight = await detectCropHeight(width, height, data, info.channels);

  await sharp(src)
    .extract({ left: 0, top: 0, width, height: cropHeight })
    .png()
    .toFile(dst);

  console.log(`Saved emblem (${width}x${cropHeight}) -> ${dst}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
