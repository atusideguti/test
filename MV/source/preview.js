const { chromium } = require('playwright');
(async()=>{
  const frames=process.argv.slice(2).map(Number);
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await b.newPage({viewport:{width:1920,height:1080}});
  p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>console.log('console:',m.text()));
  await p.goto('file://'+require('path').resolve('index.html'));await p.evaluate(()=>window.ready);
  require('fs').mkdirSync('prev',{recursive:true});
  for(const f of frames){await p.evaluate(f=>window.renderFrame(f),f);await p.locator('#c').screenshot({path:`prev/f${String(f).padStart(4,'0')}.png`});}
  await b.close();
})();
