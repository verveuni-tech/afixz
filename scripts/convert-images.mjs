import sharp from "sharp";
import { readdirSync } from "fs";
import { join, parse } from "path";

const DIR = "src/assets/images";

for (const file of readdirSync(DIR)) {
  if (!file.endsWith(".png")) continue;
  const { name } = parse(file);
  const input = join(DIR, file);

  // Desktop WebP — 1200px wide
  await sharp(input)
    .resize(1200, 800, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(join(DIR, `${name}.webp`));

  // Mobile WebP — 640px wide, lower quality
  await sharp(input)
    .resize(640, 427, { fit: "cover" })
    .webp({ quality: 72 })
    .toFile(join(DIR, `${name}-mobile.webp`));

  console.log(`${file} → ${name}.webp + ${name}-mobile.webp`);
}

console.log("Done!");
