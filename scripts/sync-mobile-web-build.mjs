import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const thisFile = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(thisFile);
const frontendDir = path.resolve(scriptsDir, "..");
const distDir = path.join(frontendDir, "dist");
const targetDir = path.resolve(frontendDir, "..", "mobile", "assets", "web");

async function ensureDistExists() {
  try {
    const info = await stat(distDir);
    if (!info.isDirectory()) throw new Error("dist is not a directory");
  } catch {
    throw new Error("Missing frontend/dist. Run `npm run build:webview-local` first.");
  }
}

async function run() {
  await ensureDistExists();
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });
  await cp(distDir, targetDir, { recursive: true });
  console.log(`Synced web build: ${distDir} -> ${targetDir}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
