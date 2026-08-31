import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const publicDir = join(root, "public");
const outputDir = join(root, "dist", "server");
const assetFiles = [
  ["/", "index.html", "text/html; charset=utf-8"],
  ["/index.html", "index.html", "text/html; charset=utf-8"],
  ["/styles.css", "styles.css", "text/css; charset=utf-8"],
  ["/app.js", "app.js", "text/javascript; charset=utf-8"],
  ["/manifest.webmanifest", "manifest.webmanifest", "application/manifest+json; charset=utf-8"],
  ["/sw.js", "sw.js", "text/javascript; charset=utf-8"],
  ["/icon.svg", "icon.svg", "image/svg+xml; charset=utf-8"],
  ["/og.png", "og.png", "image/png", true]
];

const assets = {};
for (const [route, file, contentType, binary = false] of assetFiles) {
  const fileContent = await readFile(join(publicDir, file));
  assets[route] = {
    body: binary ? fileContent.toString("base64") : fileContent.toString("utf8"),
    contentType,
    encoding: binary ? "base64" : "utf8"
  };
}

const worker = `const ASSETS = ${JSON.stringify(assets)};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const route = ASSETS[url.pathname] ? url.pathname : request.mode === "navigate" ? "/" : null;
    if (!route) return new Response("Not found", { status: 404 });
    const asset = ASSETS[route];
    const headers = new Headers({
      "content-type": asset.contentType,
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "permissions-policy": "camera=(), microphone=(), geolocation=()"
    });
    if (route === "/sw.js") headers.set("cache-control", "no-cache");
    else if (route === "/" || route === "/index.html") headers.set("cache-control", "no-cache");
    else headers.set("cache-control", "public, max-age=86400");
    let body = asset.body;
    if (asset.contentType.startsWith("text/html")) body = body.replaceAll("__SITE_ORIGIN__", url.origin);
    if (asset.encoding === "base64") body = Uint8Array.from(atob(body), (character) => character.charCodeAt(0));
    return new Response(body, { status: 200, headers });
  }
};
`;

await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, "index.js"), worker, "utf8");
console.log("Built dist/server/index.js");
