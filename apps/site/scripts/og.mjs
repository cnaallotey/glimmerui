// Renders a 1200 x 630 social card for every page into public/og, plus
// public/apple-touch-icon.png. Run it after adding or renaming a page:
//
//   pnpm --filter site og
//
// It builds the card pages (src/pages/og/[slug].astro) into a scratch folder,
// serves them locally and screenshots each one with headless Chrome, which
// renders the WebGL effects. Set CHROME_PATH if Chrome lives elsewhere. Needs
// Node 22 or later, for its WebSocket.

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Asynchronous, so the local server below can answer Chrome meanwhile.
function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit", ...options });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} failed (${code})`))
    );
  });
}

// 1. Build the site with the card pages switched on.
await run("pnpm", ["exec", "astro", "build", "--outDir", scratch], {
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

// Drives one Chrome over its DevTools protocol, in real time. Chrome's own
// --screenshot flag with a virtual clock hangs on some WebGL pages.
async function openChrome() {
  const profile = await mkdtemp(path.join(os.tmpdir(), "glimmer-og-"));
  const child = spawn(
    chrome,
    ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--hide-scrollbars", "--no-first-run", "about:blank"],
    { stdio: "ignore" }
  );
  const close = async () => {
    child.kill("SIGKILL");
    await wait(300);
    await rm(profile, { recursive: true, force: true, maxRetries: 5 });
  };
  try {
    // Chrome writes the port it picked into its profile.
    let port;
    for (let i = 0; i < 600 && !port; i++) {
      await wait(100);
      port = await readFile(path.join(profile, "DevToolsActivePort"), "utf8").then((t) => t.split("\n")[0], () => undefined);
    }
    const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    const socket = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });
    let id = 0;
    const pending = new Map();
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      pending.get(message.id)?.(message);
      pending.delete(message.id);
    };
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${method} timed out`)), 180_000);
        pending.set(++id, ({ result, error }) => {
          clearTimeout(timer);
          if (error) reject(new Error(`${method}: ${error.message}`));
          else resolve(result);
        });
        socket.send(JSON.stringify({ id, method, params }));
      });

    const isReady = async () => {
      const { result } = await send("Runtime.evaluate", {
        expression: `document.readyState === "complete" && document.fonts.status === "loaded" &&
          (!document.querySelector(".og-visual") || !!document.querySelector(".og-visual canvas"))`,
      });
      return result.value === true;
    };
    const screenshot = async (url, file, width, height, format) => {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
      await send("Page.navigate", { url });
      // Wait for the fonts and the effect, however slow the machine is, then
      // let the effect run for a moment.
      for (let i = 0; !(await isReady()); i++) {
        if (i === 240) throw new Error(`${url} never became ready`);
        await wait(500);
      }
      await wait(2500);
      const { data } = await send("Page.captureScreenshot", { format, ...(format === "jpeg" && { quality: 82 }) });
      await writeFile(file, Buffer.from(data, "base64"));
    };
    return { screenshot, close };
  } catch (error) {
    await close();
    throw error;
  }
}

let browser;
try {
  browser = await openChrome();
  // 3. One card per page, saved as JPEG to keep the repository small.
  const cards = path.join(scratch, "cards");
  await mkdir(cards, { recursive: true });
  // Folders are card pages. Last time's .jpg files, copied from public, are not.
  const entries = await readdir(path.join(scratch, "og"), { withFileTypes: true });
  const slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  for (const slug of slugs) {
    await browser.screenshot(`${origin}/og/${slug}/`, path.join(cards, `${slug}.jpg`), 1200, 630, "jpeg");
    console.log(`og/${slug}.jpg`);
  }

  // Replace the old cards only once every new one exists.
  await rm(target, { recursive: true, force: true });
  await cp(cards, target, { recursive: true });

  // 4. The home screen icon: the logo over its own gradient, square, since
  // iOS rounds the corners itself.
  await browser.screenshot(`${origin}/icon.html`, path.join(root, "public", "apple-touch-icon.png"), 180, 180, "png");
  console.log("apple-touch-icon.png");
} finally {
  await browser?.close();
  server.close();
  server.closeAllConnections();
  await rm(scratch, { recursive: true, force: true });
}
