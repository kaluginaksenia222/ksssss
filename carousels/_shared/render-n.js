const {chromium}=require('playwright');const D=process.argv[2],N=+process.argv[3];(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+D+'/slides.html#export');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
for(let i=1;i<=N;i++){await (await p.$('#s'+i)).screenshot({path:D+'/slides/slide-'+i+'.png'})}await b.close()})();
