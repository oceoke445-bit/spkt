import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const src =
  process.argv[2] ??
  'C:/Users/najri/.cursor/projects/c-Users-najri-Downloads-Digital-Police-Service-Website/assets/c__Users_najri_AppData_Roaming_Cursor_User_workspaceStorage_e32951d61334520acfcea251a3881d94_images_BCO.93b6c56f-e395-46a4-a285-cb43d656867f-3761a222-d2af-4a86-81a1-f15fad1c383a.png';
const dst = path.join(process.cwd(), 'public', 'spkt-logo.png');
const tmp = path.join(process.cwd(), 'public', 'spkt-logo.tmp.png');

function isBackgroundPixel(r, g, b) {
  return r < 40 && g < 40 && b < 40;
}

async function main() {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  for (const [x, y] of [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ]) {
    const pi = y * width + x;
    const i = pi * channels;
    if (isBackgroundPixel(data[i], data[i + 1], data[i + 2])) {
      queue.push([x, y]);
    }
  }

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;

    const pi = y * width + x;
    if (visited[pi]) continue;

    const i = pi * channels;
    if (!isBackgroundPixel(data[i], data[i + 1], data[i + 2])) continue;

    visited[pi] = 1;
    data[i + 3] = 0;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  fs.mkdirSync(path.dirname(dst), { recursive: true });
  let pipeline = sharp(data, { raw: { width, height, channels } });
  await pipeline.trim({ threshold: 10 }).png().toFile(tmp);
  fs.renameSync(tmp, dst);
  console.log(`Saved transparent logo to ${dst}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
