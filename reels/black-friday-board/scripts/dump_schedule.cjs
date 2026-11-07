// Достаёт из index.html моменты всех перекидок табло — для звука.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto("file://" + path.resolve(__dirname, "../index.html"));
  const s = await p.evaluate(() => ({ FLIPS, T, SCENES: SCENES.map((x) => x.t) }));
  fs.writeFileSync(path.resolve(__dirname, "schedule.json"), JSON.stringify(s));
  await b.close();
  console.log("перекидок", s.FLIPS.length);
})();
