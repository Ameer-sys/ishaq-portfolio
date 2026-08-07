const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const baseUrl = process.env.PORTFOLIO_URL || "http://127.0.0.1:4173";

async function renderImage(page, source, output, width, height) {
  await page.setViewportSize({ width, height });
  await page.setContent(`
    <!doctype html>
    <html>
      <head><style>* { box-sizing: border-box; } html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; } img { display: block; width: 100%; height: 100%; object-fit: contain; }</style></head>
      <body><img src="${baseUrl}/${source}" alt=""></body>
    </html>
  `);
  await page.locator("img").evaluate((image) => image.complete || new Promise((resolve) => {
    image.addEventListener("load", resolve, { once: true });
  }));
  await page.screenshot({ path: path.join(root, output) });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await renderImage(page, "assets/og-card.svg", "assets/og-card.png", 1200, 630);
  await renderImage(page, "assets/app-icon.svg", "assets/apple-touch-icon.png", 180, 180);

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
