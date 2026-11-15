// Fractal Pulse regression suite (software-GL, simulated inputs).  Run:  NODE_PATH=$(npm root -g) node tests/regression.js [--quick]
// Needs Playwright + Chromium. Everything here uses SIMULATED input (no real iPhone, GPU, camera or microphone).
const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path'); const {execSync}=require('child_process');
const URL='file://'+path.resolve(__dirname,'..','index.html'); const QUICK=process.argv.includes('--quick');
const ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'];
const results=[]; const rec=(name,ok,info)=>{ results.push({name,ok:!!ok,info:info===undefined?'':String(info)}); console.log((ok?'PASS ':'FAIL ')+name+(info!==undefined&&info!==''?'  ['+info+']':'')); };
async function page(browser,hash,opts={}){ const ctx=await browser.newContext(opts.ctx||{}); const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push('pageerror: '+e.message)); p.on('console',m=>{ if(m.type()==='error') p.errs.push(m.text().slice(0,200)); });
  if(opts.init) await p.addInitScript(opts.init);
  await p.goto(URL+'#orbit=0&auto=0&'+hash,{waitUntil:'commit'}); await p.waitForSelector('#bSilent',{timeout:240000}); await p.click('#bSilent',{timeout:240000});
  await p.evaluate(()=>{ document.getElementById('sTrans').value='cut'; document.getElementById('cAuto').checked=false; }); return p; }
const errText=p=>p.evaluate(()=>document.getElementById('err').textContent||'');
(async()=>{
  const commit=(()=>{ try{ return execSync('git rev-parse --short HEAD',{cwd:path.resolve(__dirname,'..')}).toString().trim(); }catch(e){ return '?'; } })();
  const b=await chromium.launch({args:ARGS});
  // ── G1: load, themes, state ──
  { const p=await page(b,'scale=0.15&q=0&type=0'); await p.waitForTimeout(1500);
    rec('G1 page loads, no console errors',p.errs.length===0 && !(await errText(p)),p.errs[0]||'');
    const nT=await p.evaluate(()=>TYPES.length), nF=await p.evaluate(()=>FLOWS.length), nTh=await p.evaluate(()=>THEMES.length), nR=await p.evaluate(()=>REFS.length);
    rec('G1 catalogue sizes',nT>=21&&nF>=12&&nTh===4&&nR>=9,`fractals=${nT} 2Dscenes=${nF} themes=${nTh} refs=${nR}`);
    for(let t=0;t<4;t++){ await p.evaluate(t=>setTheme(t,true),t); await p.waitForTimeout(700); }
    rec('G1 all 4 themes switch without error',!(await errText(p))&&p.errs.length===0);
    const rt=await p.evaluate(()=>{ FractalPulse.apply({type:6,shape:.4,detail:.7,hue:.3,zoom:1.2}); const st=exportState(); const t=b64e(st); const back=b64d(t); return JSON.stringify(back)===JSON.stringify(st); });
    rec('G1 share-link state round-trip',rt);
    const sl=await p.evaluate(()=>{ FractalPulse.apply({type:7}); document.querySelectorAll('#slots button')[0].click(); const s=JSON.parse(localStorage.getItem('fractalPulseSlots'))[0]; FractalPulse.apply({type:2}); document.querySelectorAll('#slots button')[0].click(); return s&&s.type===7&&shown===7; });
    rec('G1 look slots save/load',sl);
    await p.context().close(); }
  // ── G2: every 3D fractal renders ──
  { const p=await page(b,'scale=0.12&q=0&type=0'); const n=await p.evaluate(()=>TYPES.length); const bad=[]; const idx=QUICK?[0,5,6,14,19]:[...Array(n).keys()];
    for(const t of idx){ await p.evaluate(t=>applyState({type:t,theme:3,realIdx:4,palIdx:0,zoom:1,az:.5,el:.2,sym:0,ang:[.3,.5,.1],warp:.1}),t); const f0=await p.evaluate(()=>frame); let adv=true; try{ await p.waitForFunction(f=>frame>f+1,f0,{timeout:40000}); }catch(e){ adv=false; } if((await errText(p))||p.errs.length||!adv) bad.push(t+(!adv?'(stalled)':'(err)')); }
    rec(`G2 ${idx.length} 3D fractals render`,bad.length===0,bad.join(','));
    await p.context().close(); }
  // ── G3: every 2D scene compiles/renders ──
  { const p=await page(b,'scale=0.12&q=0'); const n=await p.evaluate(()=>FLOWS.length); const bad=[]; await p.evaluate(()=>setFlow(true,true));
    for(let i=0;i<(QUICK?4:n);i++){ await p.evaluate(i=>setFlowVar(i,true),i); const f0=await p.evaluate(()=>frame); let adv=true; try{ await p.waitForFunction(f=>frame>f+1,f0,{timeout:40000}); }catch(e){ adv=false; } if((await errText(p))||p.errs.length||!adv) bad.push(i); }
    rec(`G3 ${QUICK?4:n} 2D scenes render`,bad.length===0,bad.join(','));
    await p.context().close(); }
  // ── G4: performance takes v1 ──
  { const p=await page(b,'scale=0.15&q=0&type=0'); await p.evaluate(()=>startDemo()); await p.waitForTimeout(1200);
    await p.evaluate(()=>FractalPulse.startTake()); await p.waitForFunction(()=>takeRec&&takeRec.frames.length>=3,null,{timeout:60000}); await p.evaluate(()=>{ FractalPulse.setType(6); }); await p.waitForTimeout(700);
    await p.evaluate(()=>{ const s=document.getElementById('sMB'); s.value=.55; s.dispatchEvent(new Event('input')); setTheme(2,true); FractalPulse.observe('hand',{x:.4}); }); const nf=await p.evaluate(()=>takeRec.frames.length); await p.waitForFunction(n=>takeRec.frames.length>=n+3,nf,{timeout:60000}); await p.evaluate(()=>FractalPulse.stopTake());
    const info=await p.evaluate(()=>({dur:take.duration,frames:take.frames.length,ev:take.events.length,obs:take.observations.length,fmt:take.format,v:take.v}));
    rec('G4 take records (frames+events+observations)',info.frames>=2&&info.ev>=3&&info.obs===1&&info.fmt==='fractal-pulse-performance'&&info.v===1,JSON.stringify(info));
    const pl=await p.evaluate(()=>{ setType(2); setTheme(0,true); document.getElementById('sMB').value=0; playStart(); playSeek(take.duration-.05); const r={shown,theme,sMB:+document.getElementById('sMB').value}; playStop(); return r; });
    rec('G4 playback restores fractal/theme/sculpt',pl.shown===6&&pl.theme===2&&Math.abs(pl.sMB-.55)<.01,JSON.stringify(pl));
    const rs=await p.evaluate(()=>{ setTheme(1,true); document.getElementById('cTakeLook').checked=false; playStart(); playSeek(take.duration-.05); const r={theme,shown}; playStop(); document.getElementById('cTakeLook').checked=true; return r; });
    rec('G4 re-skin keeps own theme, take fractal',rs.theme===1&&rs.shown===6,JSON.stringify(rs));
    const jt=await p.evaluate(()=>{ const s=JSON.stringify(take); loadTakeObj(JSON.parse(s)); const a=take.frames.length; takeTrim(.5,take.duration); let rej; try{ loadTakeObj({format:'x'}); rej='accepted'; }catch(e){ rej='rejected'; } return {a,trimmedFrames:take.frames.length,rej}; });
    rec('G4 JSON round-trip, trim, reject garbage',jt.trimmedFrames<jt.a&&jt.rej==='rejected',JSON.stringify(jt));
    rec('G4 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }
  // ── G5: iOS audio-session handling (simulated session that rejects capture in 'playback') ──
  { const init=()=>{ let t='auto'; window.__asLog=[]; Object.defineProperty(navigator,'audioSession',{value:{get type(){return t;},set type(v){ t=v; window.__asLog.push(v); }},configurable:true});
      const gum=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices); navigator.mediaDevices.getUserMedia=async c=>{ if(t==='playback') throw new Error('AudioSession category is not compatible with audio capture.'); return gum(c); }; };
    const ctx={permissions:['microphone']}; const browserCtx=await b.newContext(ctx); const p=await browserCtx.newPage(); p.errs=[]; await p.addInitScript(init);
    await p.goto(URL+'#scale=0.12&q=0'); await p.click('#bMic',{timeout:240000}); await p.waitForTimeout(2000);
    const r=await p.evaluate(()=>({log:window.__asLog,hasAudio,err:document.getElementById('err').textContent||''})); rec('G5 mic works after switching to play-and-record',r.hasAudio&&!r.err&&r.log.includes('play-and-record'),JSON.stringify(r));
    await p.evaluate(()=>startDemo()); await p.waitForTimeout(500); rec('G5 demo flips back to playback',(await p.evaluate(()=>navigator.audioSession.type))==='playback'); await browserCtx.close(); }
  // ── G6: hostile / odd URLs must not kill the render loop ──
  for(const h of ['type=abc&pal=99&look=-4&theme=77&kal=zz','s=!!notbase64!!','type=999999&theme=-3']){ const p=await page(b,'scale=0.12&q=0&'+h); await p.waitForTimeout(1500); const f=await p.evaluate(()=>frame); rec('G6 bad hash survives: '+h.slice(0,24),f>2&&!(await errText(p)),'frames='+f); await p.context().close(); }
  // optional extra suites added by later phases
  const extra=path.join(__dirname,'regression_extra.js'); if(fs.existsSync(extra)){ await require(extra)({b,page,rec,errText,URL}); }
  await b.close();
  const pass=results.filter(r=>r.ok).length; const out={commit,when:new Date().toISOString(),quick:QUICK,pass,fail:results.length-pass,results};
  fs.writeFileSync(path.join(__dirname,'last-run.json'),JSON.stringify(out,null,1)); console.log(`\n${pass}/${results.length} passed (commit ${commit})`); process.exit(results.length-pass?1:0);
})().catch(e=>{ console.error('SUITE ERROR',e); process.exit(2); });
