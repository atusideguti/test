const { chromium } = require('playwright');const {spawn}=require('child_process');
(async()=>{
  const [a,b,out]=[+process.argv[2],+process.argv[3],process.argv[4]];
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-c:v','png','-i','-','-c:v','libx264','-preset','medium','-crf','10','-pix_fmt','yuv444p',out]);
  ff.stderr.on('data',d=>process.stderr.write(d));
  const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p=await br.newPage({viewport:{width:1920,height:1080}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+require('path').resolve('index.html'));await p.evaluate(()=>window.ready);
  const loc=p.locator('#c');
  for(let f=a;f<b;f++){await p.evaluate(f=>window.renderFrame(f),f);const buf=await loc.screenshot({type:'png'});
    if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(f%100===0)console.log(out,f);}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await br.close();console.log('done',out);
})();
