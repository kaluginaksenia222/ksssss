// node render.js data/kv-1.json out/kv-1.png
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
(async()=>{const [inp,out]=process.argv.slice(2);const d=fs.readFileSync(inp,'utf8');
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+path.resolve(__dirname,'story.html')+'#'+encodeURIComponent(JSON.stringify(JSON.parse(d))));
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
fs.mkdirSync(path.dirname(out),{recursive:true});await p.screenshot({path:out});await b.close();})();
