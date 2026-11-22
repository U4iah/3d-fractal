// iPhone 16 Pro check kit (simulated). Real WebKit engine + iPhone 16 Pro screen/touch profile, software GL, so it catches layout/logic/engine problems.
// It is NOT iOS: audio interruptions, the silent switch, Control Center, home-screen mode, GPU speed and heat need the real phone (use ?diag=1 there).
// Usage: NODE_PATH=$(npm root -g) node tests/iphone/run.js [--stress] [--shots]    (--stress: Chromium + iPhone profile + 4x CPU slowdown)
const pw=require('playwright'), path=require('path'), fs=require('fs'), os=require('os');
const URL='file://'+path.resolve(__dirname,'../../index.html'); const stress=process.argv.includes('--stress'), shots=process.argv.includes('--shots');
const out=path.join(__dirname,'out'); if(shots) fs.mkdirSync(out,{recursive:true});
const res=[]; const rec=(n,ok,d)=>{ res.push({n,ok}); console.log((ok?'PASS ':'FAIL ')+n+(d?'  ['+String(d).slice(0,300)+']':'')); };
function wav(sec,sr){ const n=sr*sec,b=Buffer.alloc(44+n*2); b.write('RIFF',0); b.writeUInt32LE(36+n*2,4); b.write('WAVEfmt ',8); b.writeUInt32LE(16,16); b.writeUInt16LE(1,20); b.writeUInt16LE(1,22); b.writeUInt32LE(sr,24); b.writeUInt32LE(sr*2,28); b.writeUInt16LE(2,32); b.writeUInt16LE(16,34); b.write('data',36); b.writeUInt32LE(n*2,40); for(let i=0;i<n;i++){ const t=i/sr, env=(i%(sr/2))<sr/8?1:0.2; b.writeInt16LE(Math.round(Math.sin(2*Math.PI*(i%(sr)<sr/2?110:220)*t)*14000*env),44+i*2); } return b; }
(async()=>{
  const dev=pw.devices['iPhone 16 Pro']; let b, ctxOpts={...dev}; 
  if(stress){ b=await pw.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']}); const {defaultBrowserType,...rest}=dev; ctxOpts=rest; }
  else b=await pw.webkit.launch();
  const ctx=await b.newContext({...ctxOpts,acceptDownloads:true}); const p=await ctx.newPage(); const errs=[]; p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); }); p.on('pageerror',e=>errs.push('pageerror '+e.message));
  if(stress){ const c=await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate',{rate:4}); }
  console.log('engine:',stress?'Chromium (iPhone 16 Pro profile, 4x CPU slowdown)':'WebKit (iPhone 16 Pro profile)');
  await p.goto(URL+'?scale=0.15&q=0'); await p.waitForFunction(()=>typeof frame!=='undefined'&&frame>2,null,{timeout:300000});
  const ua=await p.evaluate(()=>({ua:navigator.userAgent.includes('iPhone'),coarse:matchMedia('(pointer:coarse)').matches,w:innerWidth,h:innerHeight,dpr:devicePixelRatio,gl2:!!document.createElement('canvas').getContext('webgl2')}));
  rec('iPhone 16 Pro profile: iPhone user agent, touch, 402pt wide, WebGL2',ua.ua&&ua.coarse&&ua.w===402&&ua.gl2,JSON.stringify(ua));
  if(shots) await p.screenshot({path:path.join(out,'01-start.png')});
  const ov=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth}));
  rec('no sideways scrolling on the start screen',ov.sw<=ov.iw+1,JSON.stringify(ov));
  await p.tap('#bSilent').catch(()=>p.click('#bSilent')); await p.waitForTimeout(1500);
  const d=await p.evaluate(()=>({guard:document.getElementById('cSafeGuard').checked,sync:+document.getElementById('sSync').value}));
  rec('phone defaults: flash-guard readback off, sync delay 0',!d.guard&&d.sync===0,JSON.stringify(d));
  const ov2=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth}));
  rec('no sideways scrolling in the instrument',ov2.sw<=ov2.iw+1,JSON.stringify(ov2));
  const small=await p.evaluate(()=>[...document.querySelectorAll('button:not([disabled])')].filter(e=>{ const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&r.top<innerHeight&&r.bottom>0&&Math.min(r.width,r.height)<30; }).map(e=>(e.id||e.textContent||'?').trim().slice(0,18)));
  console.log('INFO visible buttons under 30 px on their short side:',small.length,small.slice(0,12).join(', '));
  if(shots) await p.screenshot({path:path.join(out,'02-instrument.png')});
  // real song through the real file path; the player must not thrash between play and pause
  await p.evaluate(()=>fpDiag.start());
  await p.setInputFiles('#fFile',{name:'test beat.wav',mimeType:'audio/wav',buffer:wav(20,22050)}).catch(e=>console.log('setInputFiles',e.message.slice(0,100)));
  await p.waitForTimeout(12000);
  const a=await p.evaluate(()=>{ const s=fpDiag.state(); return {flips:s.playPauseFlips,paused:s.player.paused,t:s.player.t,ready:s.player.ready,ctx:s.audioCtx&&s.audioCtx.state,guard:s.audioLoopGuard.tripped,err:s.player.err}; });
  rec('a loaded song does not flip between play and pause (loop guard untouched, < 6 flips in 12 s)',a.flips<6&&!a.guard&&!a.err,JSON.stringify(a));
  console.log('INFO audio in this simulated engine: player',a.paused?'paused':'playing','at',a.t,'s, context',a.ctx,'(headless engines may not output sound)');
  const f=await p.evaluate(()=>{ const s=fpDiag.state(); return {fpsAvg:s.fpsAvg,fpsMin:s.fpsMin,long:s.longTasks,longMs:s.longTaskMs}; }); console.log('INFO frame rate here (software GL, not a phone GPU):',JSON.stringify(f));
  // diagnostics panel by five taps on the build label
  await p.evaluate(()=>{ const el=document.getElementById('buildTag2')||document.getElementById('buildTag'); for(let i=0;i<5;i++) el.click(); });
  const dg=await p.evaluate(()=>{ const pan=document.getElementById('dgPanel'); let ok=false; try{ const j=JSON.parse(fpDiag.report()); ok=j.format==='fractal-pulse-diagnostics'&&j.state.build; }catch(e){} return {panel:!!pan,ok:!!ok}; });
  rec('diagnostics panel opens (5 taps on the build label) and produces a valid report',dg.panel&&dg.ok,JSON.stringify(dg));
  if(shots){ await p.screenshot({path:path.join(out,'03-diag.png')}); }
  await p.evaluate(()=>fpDiag.open());
  // take: record, stop, card
  const t=await p.evaluate(async()=>{ FractalPulse.startTake(); for(let i=0;i<400&&!(takeRec&&takeRec.frames.length>=3);i++) await new Promise(r=>setTimeout(r,50)); FractalPulse.stopTake(); for(let i=0;i<80&&!document.getElementById('takeCard').classList.contains('show');i++) await new Promise(r=>setTimeout(r,100)); const c=document.getElementById('takeCard'); const r=c.getBoundingClientRect(); return {shown:c.classList.contains('show'),inView:r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight+1,btn:!!document.getElementById('tcVideo')}; });
  rec('stopping a take shows the card fully on screen with a video button',t.shown&&t.inView&&t.btn,JSON.stringify(t));
  if(shots) await p.screenshot({path:path.join(out,'04-take-card.png')});
  rec('no console errors',errs.filter(e=>!/Fetch API cannot load|Failed to load|ran out of memory|Origin null/.test(e)).length===0,errs.slice(0,3).join(' | '));
  await b.close(); const pass=res.filter(r=>r.ok).length; console.log(`\n${pass}/${res.length} passed (${stress?'chromium stress':'webkit'} iPhone 16 Pro, simulated)`); process.exit(pass===res.length?0:1);
})().catch(e=>{ console.error('RUN ERROR',e.message); process.exit(2); });
