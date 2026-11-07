// Достаёт из index.html моменты: окна гаснут/загораются, буквы — для звука.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto("file://" + path.resolve(__dirname, "../index.html"));
  const s = await p.evaluate(() => ({ T, OFF: OFF_TIMES, ON: ON_TIMES, KEYS: TIMES.flat().concat(LAB_TIMES) }));
  fs.writeFileSync(path.resolve(__dirname, "schedule.json"), JSON.stringify(s));
  await b.close();
  console.log("гаснут", s.OFF.length, "загораются", s.ON.length, "букв", s.KEYS.length);
})();
