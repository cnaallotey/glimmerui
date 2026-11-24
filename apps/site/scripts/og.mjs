// Renders a 1200 x 630 social card for every page into public/og, plus
// public/apple-touch-icon.png. Run it after adding or renaming a page:
//
//   pnpm --filter site og
//
// It builds the card pages (src/pages/og/[slug].astro) into a scratch folder,
// serves them locally and screenshots each one with headless Chrome, which
// renders the WebGL effects. Set CHROME_PATH if Chrome lives elsewhere.

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scratch = path.join(root, "node_modules", ".og-build");
const target = path.join(root, "public", "og");
const chrome =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

if (!existsSync(chrome)) {
  console.error(`Chrome not found at ${chrome}. Set CHROME_PATH.`);
  process.exit(1);
}

// Asynchronous, so the local server below can answer Chrome while it runs.
function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit", timeout: 60_000, ...options });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} failed (${code})`))
    );
  });
}

// 1. Build the site with the card pages switched on.
await run("pnpm", ["exec", "astro", "build", "--outDir", scratch], {
  timeout: 300_000,
  env: { ...process.env, OG_CARDS: "1" },
});

// 2. Serve the build. Its links carry the site's base path, so strip it.
const { default: config } = await import(path.join(root, "astro.config.mjs"));
const base = (config.base ?? "/").replace(/\/$/, "");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  let url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (base && url.startsWith(base)) url = url.slice(base.length) || "/";
  let file = path.join(scratch, url);
  if (!file.startsWith(scratch)) return res.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
const iconPage = `<!doctype html><body style="margin:0;background:linear-gradient(45deg,#3B1D8F,#E0457B 55%,#F9B44C)"><img src="${base}/favicon.svg" width="180" height="180" style="display:block">`;
await writeFile(path.join(scratch, "icon.html"), iconPage);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}${base}`;

async function screenshot(url, file, width, height) {
  // Headless Chrome occasionally hangs on a WebGL page, so try more than once.
  for (let attempt = 1; ; attempt++) {
    try {
      return await capture(url, file, width, height);
    } catch (error) {
      if (attempt === 3) throw error;
    }
  }
}

function capture(url, file, width, height) {
  return run(
    chrome,
    [
      "--headless=new",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${width},${height}`,
      // Lets fonts and images load and the effects run for a moment.
      "--virtual-time-budget=4000",
      `--screenshot=${file}`,
      url,
    ],
    // SIGKILL: a hung Chrome ignores the gentler default.
    { stdio: "ignore", timeout: 30_000, killSignal: "SIGKILL" }
  );
}

try {
  // 3. One card per page, saved as JPEG to keep the repository small.
  const cards = path.join(scratch, "cards");
  await mkdir(cards, { recursive: true });
  // Folders are card pages. Last time's .jpg files, copied from public, are not.
  const entries = await readdir(path.join(scratch, "og"), { withFileTypes: true });
  const slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  for (const slug of slugs) {
    const png = path.join(scratch, `${slug}.png`);
    await screenshot(`${origin}/og/${slug}/`, png, 1200, 630);
    await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", png, "--out", path.join(cards, `${slug}.jpg`)], {
      stdio: "ignore",
    });
    console.log(`og/${slug}.jpg`);
  }

  // Replace the old cards only once every new one exists.
  await rm(target, { recursive: true, force: true });
  await cp(cards, target, { recursive: true });

  // 4. The home screen icon: the logo over its own gradient, square, since
  // iOS rounds the corners itself.
  await screenshot(`${origin}/icon.html`, path.join(root, "public", "apple-touch-icon.png"), 180, 180);
  console.log("apple-touch-icon.png");
} finally {
  server.close();
  await rm(scratch, { recursive: true, force: true });
}
