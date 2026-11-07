// Рендер сцены мультика в видео: node kids-channel/lib/render.js <scene.js> <out.mp4> [audio.wav] [от] [до] [fps]
// Или кадры для проверки: node kids-channel/lib/render.js <scene.js> --stills <папка> t1 t2 ...
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

(async () => {
  const [sceneFile, out, ...rest] = process.argv.slice(2);
  const scene = require(path.resolve(sceneFile));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: scene.W, height: scene.H }, deviceScaleFactor: 1 });
  await page.setContent('<html><body style="margin:0;background:#fff"><div id="r"></div></body></html>');
  const shot = async (t) => {
    await page.evaluate((svg) => { document.getElementById('r').innerHTML = svg; }, scene.frame(t));
    return page.screenshot({ type: 'png' });
  };

  if (out === '--stills') {
    const dir = rest[0];
    fs.mkdirSync(dir, { recursive: true });
    for (const t of rest.slice(1).map(Number)) fs.writeFileSync(path.join(dir, `t${t.toFixed(2)}.png`), await shot(t));
    await browser.close();
    return;
  }

  const audio = rest[0] && rest[0] !== '-' ? rest[0] : null;
  const from = Number(rest[1] || 0), to = Number(rest[2] || scene.DURATION), fps = Number(rest[3] || 30);
  const args = ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-'];
  if (audio) args.push('-ss', String(from), '-t', String(to - from), '-i', audio);
  args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium');
  if (audio) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push(out);
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'inherit'] });
  const n = Math.round((to - from) * fps);
  for (let i = 0; i < n; i++) {
    const buf = await shot(from + i / fps);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
  console.log('готово:', out, n, 'кадров');
})();
