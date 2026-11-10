const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({deviceScaleFactor:Number(process.argv[2]||1)});
await p.goto('file://'+path.resolve(__dirname,'cards.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
const out=process.argv[3]||'.';for(const id of ['c1','c2','c3']){await p.locator('#'+id).screenshot({path:`${out}/${id}.jpg`,type:'jpeg',quality:93});}
await b.close();})();
