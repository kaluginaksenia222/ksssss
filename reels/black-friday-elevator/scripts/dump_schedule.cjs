// Достаёт расписание из index.html (этажи, буквы, моменты), чтобы звук совпал с картинкой.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto("file://" + path.resolve(__dirname, "../index.html"));
  const s = await p.evaluate(() => ({ FLOORS, T, TIMES1, TIMES2, PCT }));
  fs.writeFileSync(path.resolve(__dirname, "schedule.json"), JSON.stringify(s, null, 1));
  await b.close();
  console.log("этажей", s.FLOORS.length, "букв", s.TIMES1.flat().length + s.TIMES2.flat().length);
})();
