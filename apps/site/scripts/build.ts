import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const distDir = resolve(rootDir, "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(resolve(distDir, "assets"), { recursive: true });

await build({
  entryPoints: [resolve(rootDir, "src/main.ts")],
  bundle: true,
  format: "esm",
  target: "es2022",
  outdir: resolve(distDir, "assets"),
  entryNames: "app",
  assetNames: "[name]",
  sourcemap: true,
  define: {
    __GET_OUT_SPAM_API_BASE_URL__: JSON.stringify(process.env.GET_OUT_SPAM_API_BASE_URL ?? "")
  },
  logLevel: "info"
});

await copyFile(resolve(rootDir, "index.html"), resolve(distDir, "index.html"));
