import fs from "node:fs";
import sharp from "sharp";

const svg = fs.readFileSync("public/icon.svg");

async function png(size, file) {
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: "#fbfaf6" })
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log("wrote", file);
}

await png(192, "public/icon-192.png");
await png(512, "public/icon-512.png");
await png(180, "public/apple-touch-icon.png");

// Maskable icon: same artwork at 80% inside the safe zone on a solid field.
const inner = await sharp(svg, { density: 384 })
  .resize(410, 410, { fit: "contain" })
  .png()
  .toBuffer();
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: "#fbfaf6",
  },
})
  .composite([{ input: inner, gravity: "centre" }])
  .png({ compressionLevel: 9 })
  .toFile("public/icon-maskable-512.png");
console.log("wrote public/icon-maskable-512.png");

// ICO container with PNG-encoded 16/32/48/256 entries (browser supported).
const sizes = [16, 32, 48, 256];
const entries = [];
for (const size of sizes) {
  const data = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: "#fbfaf6" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  entries.push({ size, data });
}

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(entries.length, 4);

let offset = 6 + entries.length * 16;
const directory = Buffer.alloc(entries.length * 16);
entries.forEach(({ size, data }, i) => {
  const base = i * 16;
  directory.writeUInt8(size >= 256 ? 0 : size, base);
  directory.writeUInt8(size >= 256 ? 0 : size, base + 1);
  directory.writeUInt8(0, base + 2);
  directory.writeUInt8(0, base + 3);
  directory.writeUInt16LE(1, base + 4);
  directory.writeUInt16LE(32, base + 6);
  directory.writeUInt32LE(data.length, base + 8);
  directory.writeUInt32LE(offset, base + 12);
  offset += data.length;
});

fs.writeFileSync(
  "src/app/favicon.ico",
  Buffer.concat([header, directory, ...entries.map((e) => e.data)]),
);
console.log("wrote src/app/favicon.ico");

for (const file of [
  "public/icon-192.png",
  "public/icon-512.png",
  "public/icon-maskable-512.png",
  "public/apple-touch-icon.png",
  "src/app/favicon.ico",
]) {
  console.log(file, fs.statSync(file).size, "bytes");
}
