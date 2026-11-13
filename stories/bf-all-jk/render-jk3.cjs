// node render.cjs → renders/post-jk3-1080.png
const { chromium } = require("playwright"); const path = require("path");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  await p.goto("file://" + path.resolve(__dirname, "post-jk3.html")); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  await p.screenshot({ path: path.resolve(__dirname, "renders/post-jk3-1080.png") }); await b.close();
})();
