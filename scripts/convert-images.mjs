import sharp from "sharp";
import { readdirSync } from "fs";
import { join, parse } from "path";

const DIR = "src/assets/images";

for (const file of readdirSync(DIR)) {
  if (!file.endsWith(".png")) continue;
  const { name } = parse(file);
  const input = join(DIR, file);

  // WebP — quality 80, much smaller
  await sharp(input)
    .resize(1200, 800, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(join(DIR, `${name}.webp`));

  console.log(`${file} → ${name}.webp`);
}

console.log("Done!");
