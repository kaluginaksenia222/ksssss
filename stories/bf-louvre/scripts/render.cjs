// Рендер сторис в PNG 1080×1920: node scripts/render.cjs [выход.png]
const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const out = process.argv[2] || "renders/story.png";
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.resolve(__dirname, "../story.html") + "?id=" + (process.argv[3] || "339"));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await page.screenshot({ path: out, type: "png" });
  await browser.close();
  console.log(out);
})();
