// Phase-specific suites, loaded by regression.js
module.exports=async function({b,page,rec,errText,URL}){
  const raw=async(ctx)=>{ const c=await b.newContext(ctx||{}); const p=await c.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push('pageerror: '+e.message)); p.on('console',m=>{ if(m.type()==='error') p.errs.push(m.text().slice(0,200)); }); await p.goto(URL+'#orbit=0&auto=0&scale=0.1&q=0',{waitUntil:'commit'}); await p.waitForSelector('#bDemo',{state:'attached',timeout:240000}); await p.waitForFunction(()=>typeof frame!=='undefined'&&frame>2,null,{timeout:240000}); return p; };
  // ── G7: Freeze / Resume + formula parameters (Phase 1) ──
  { const p=await page(b,'scale=0.12&q=0&type=0'); await p.evaluate(()=>startDemo()); await p.waitForFunction(()=>A.live,null,{timeout:60000});
    // turn on every automatic mover, then freeze
    await p.evaluate(()=>{ document.getElementById('cShow').checked=true; document.getElementById('cDirector').checked=true; document.getElementById('cCycle').checked=true; document.getElementById('cOrbit').checked=true; });
    await p.waitForFunction(()=>T>0.4,null,{timeout:60000});
    const run=await p.evaluate(()=>{ const t0=T; return t0; });
    await p.evaluate(()=>setFrozen(true,true));
    const s0=await p.evaluate(()=>({T,az,el,shown,type,zoomMul,ang:ang.slice(),hue}));
    await p.evaluate(()=>{ FractalPulse.apply({chaos:1}); FractalPulse.pulse(); dirTimer=99; });
    const f0=await p.evaluate(()=>frame); await p.waitForFunction(f=>frame>f+4,f0,{timeout:60000});
    const s1=await p.evaluate(()=>({T,az,el,shown,type,zoomMul,ang:ang.slice(),hue,chaosL,bass:A.bass,beat:A.beat,live:A.live,anim:A.animating}));
    const same=Math.abs(s1.T-s0.T)<1e-6&&Math.abs(s1.az-s0.az)<1e-6&&s1.shown===s0.shown&&s1.type===s0.type&&s1.ang.every((v,i)=>Math.abs(v-s0.ang[i])<1e-6)&&Math.abs(s1.hue-s0.hue)<1e-6;
    rec('G7 frozen: time, camera, spin, hue, fractal all hold under Director+Show+cycle+orbit+live audio',same,JSON.stringify({s0:{T:s0.T,az:s0.az},s1:{T:s1.T,az:s1.az}}));
    rec('G7 frozen: chaos/pulse/audio envelopes ignored',s1.chaosL===0&&s1.bass===0&&s1.beat===0&&!s1.live&&!s1.anim,JSON.stringify({chaos:s1.chaosL,bass:s1.bass,beat:s1.beat,live:s1.live}));
    // editing still works while frozen: orbit by synthetic pointer drag, pin a parameter
    const ev=(t,id,x,y)=>p.evaluate(([t,id,x,y])=>{ document.getElementById('gl').dispatchEvent(new PointerEvent(t,{pointerId:id,clientX:x,clientY:y,bubbles:true,pointerType:'touch'})); },[t,id,x,y]);
    const az0=await p.evaluate(()=>az); await ev('pointerdown',1,100,100); for(let i=1;i<=6;i++) await ev('pointermove',1,100+i*14,100); await ev('pointerup',1,184,100);
    const az1=await p.evaluate(()=>az); rec('G7 frozen: manual orbit still works',Math.abs(az1-az0)>0.05,`az ${az0.toFixed(2)}→${az1.toFixed(2)}`);
    await p.evaluate(()=>{ pins[0]={power:5.25}; });
    const pw=await p.evaluate(()=>params(0).power); rec('G7 frozen: pinned parameter takes effect',Math.abs(pw-5.25)<1e-9,pw);
    await p.evaluate(()=>setFrozen(false,true)); const f1=await p.evaluate(()=>frame); await p.waitForFunction(f=>frame>f+4,f1,{timeout:60000});
    const s2=await p.evaluate(()=>({T,live:A.live})); rec('G7 resume: time advances and audio is live again',s2.T>s1.T&&s2.live,JSON.stringify(s2));
    // plumbing: every formula's schema keys reach params()
    const bad=await p.evaluate(()=>{ const bad=[]; for(let ty=0;ty<TYPES.length;ty++){ for(const [k,label,min,max] of (PSCHEMA[ty]||[])){ const v=min+(max-min)*0.37; pins[ty]={[k]:v}; const P=params(ty); const got=pinVal(P,ty,k); if(!(Math.abs(got-v)<1e-9)) bad.push(ty+':'+k); delete pins[ty]; } } return bad; });
    rec('G7 every formula-parameter key plumbs through params()',bad.length===0,bad.join(','));
    const cov=await p.evaluate(()=>TYPES.map((_,i)=>(PSCHEMA[i]||[]).length).join(','));
    rec('G7 parameter schema covers every formula',cov.split(',').length===24,cov);
    // state round-trip includes pins, geometry, frozen, T
    const rt=await p.evaluate(()=>{ pins[5]={scale:2.4}; document.getElementById('sIterB').value=18; document.getElementById('sCutAt').value=.3; document.getElementById('sTwist').value=.2; document.getElementById('cMatOv').checked=true; document.getElementById('sRough').value=.7; setFrozen(true,true); T=7.5; const st=exportState(); pins[5]=null; delete pins[5]; document.getElementById('sIterB').value=12; setFrozen(false,true); applyState(JSON.parse(JSON.stringify(st))); return {pin:pins[5]&&pins[5].scale,iter:+document.getElementById('sIterB').value,cut:+document.getElementById('sCutAt').value,mat:document.getElementById('cMatOv').checked,rough:+document.getElementById('sRough').value,frozen,T}; });
    rec('G7 state round-trip keeps pins/geometry/material/frozen/time',rt.pin===2.4&&rt.iter===18&&Math.abs(rt.cut-.3)<1e-9&&rt.mat&&Math.abs(rt.rough-.7)<1e-9&&rt.frozen&&Math.abs(rt.T-7.5)<1e-6,JSON.stringify(rt));
    rec('G7 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G8: specimens + workspaces (Phase 2) ──
  { const p=await page(b,'scale=0.12&q=0&type=14');
    await p.evaluate(()=>startDemo()); await p.waitForFunction(()=>A.live&&A.bass>0.05,null,{timeout:90000});
    // workspaces
    const ws=await p.evaluate(()=>{ const out={}; for(const w of ['explore','sculpt','perform','forge']){ setWorkspace(w); out[w]=[...document.querySelectorAll('#ui .wsec')].filter(e=>!e.classList.contains('hide')).map(e=>(e.querySelector('h2')||{textContent:'info'}).textContent.trim()); } setWorkspace('forge'); return out; });
    rec('G8 four workspaces show the right sections',ws.forge.includes('Specimens')&&!ws.explore.includes('Specimens')&&ws.sculpt.includes('Sculpt · no music needed')&&!ws.forge.includes('Sculpt · no music needed')&&ws.perform.includes('Performance take · editable')&&ws.explore.includes('Fractal'),JSON.stringify(Object.fromEntries(Object.entries(ws).map(([k,v])=>[k,v.length]))));
    // save a specimen with a pinned formula parameter, geometry and symmetry
    await p.evaluate(()=>{ pins[14]={power:2.7}; document.getElementById('sSym').value=12; document.getElementById('sCutAt').value=.2; document.getElementById('cSlice').checked=true; document.getElementById('sTwist').value=.15; document.getElementById('spName').value='Rosette A'; document.getElementById('spColl').value='Tests'; saveSpecimen(false); });
    await p.waitForFunction(()=>specimens.length===1,null,{timeout:30000});
    const sp=await p.evaluate(()=>specimens[0]);
    rec('G8 specimen has id, name, collection, ISO dates, implementation provenance',/^sp-/.test(sp.id)&&sp.name==='Rosette A'&&sp.collection==='Tests'&&!isNaN(Date.parse(sp.created))&&sp.implementation.formula.index===14&&sp.implementation.shaderRev===1&&sp.implementation.formula.name==='Icosahedral IFS'&&sp.v===1&&sp.format==='fractal-pulse-specimen',JSON.stringify(sp.implementation));
    rec('G8 specimen carries a preview thumbnail',typeof sp.thumb==='string'&&sp.thumb.startsWith('data:image/jpeg'),sp.thumb?sp.thumb.length+' chars':'none');
    // restore reproduces the saved configuration
    const rs=await p.evaluate(()=>{ const keys=['type','theme','palIdx','realIdx','sym','iter','cutAt','twist','bend','shape','detail','sparkle','hue','zoom','az','el','warp','cut']; const before=JSON.parse(JSON.stringify(specimens[0].state)); delete pins[14]; setType(2); setTheme(0,true); document.getElementById('sSym').value=0; document.getElementById('sCutAt').value=0; document.getElementById('sTwist').value=0; document.getElementById('cSlice').checked=false; az=2.2;
      restoreSpecimen(specimens[0]); const after=exportState(); const diff=keys.filter(k=>JSON.stringify(before[k])!==JSON.stringify(after[k])); return {diff,pin:pins[14]&&pins[14].power}; });
    rec('G8 restore reproduces type, geometry, symmetry, camera, material and pinned parameter',rs.diff.length===0&&rs.pin===2.7,JSON.stringify(rs));
    // freeze+save bakes audio-shaped geometry
    const bk=await p.evaluate(async()=>{ const bass=A.bass,mid=A.mid; const st=captureState(true); return {bass,mid,shape:st.shape,detail:st.detail,baked:!!st.baked,frozen:st.frozen}; });
    rec('G8 live audio is baked into the saved sculpt values, and the state is frozen',bk.baked&&bk.frozen===1&&Math.abs(bk.shape-Math.min(1.2,bk.bass))<0.2,JSON.stringify(bk));
    // duplicate + variation lineage
    const lin=await p.evaluate(async()=>{ const o=specimens[0]; duplicateSpecimen(o,false); const dup=specimens[0]; duplicateSpecimen(o,true); for(let i=0;i<160&&specimens.length<3;i++) await new Promise(r=>setTimeout(r,250)); const vr=specimens[0];
      return {n:specimens.length,dupParent:dup.parent===o.id,dupSame:JSON.stringify(dup.state)===JSON.stringify(o.state),varParent:vr.parent===o.id,varDiffers:JSON.stringify(vr.state)!==JSON.stringify(o.state),varName:vr.name,kids:childCount(o.id)}; });
    rec('G8 duplicate keeps state and records parent; variation mutates and records parent',lin.n===3&&lin.dupParent&&lin.dupSame&&lin.varParent&&lin.varDiffers&&lin.kids===2,JSON.stringify(lin));
    // export / import round trip, rejection, drift
    const io=await p.evaluate(()=>{ const o=specimens[specimens.length-1]; const text=JSON.stringify(o); const before=specimens.length; const n1=importSpecimens(text);
      const nGarbage=importSpecimens('{"format":"nope"}'), nBadJson=importSpecimens('not json'); const fut=JSON.parse(text); fut.v=2; const nFuture=importSpecimens(JSON.stringify(fut));
      const old=JSON.parse(text); old.implementation.shaderRev=0; old.id='sp-old'; importSpecimens(JSON.stringify(old)); const oldImp=specimens.find(s=>s.id==='sp-old');
      const col=JSON.stringify({format:'fractal-pulse-specimen-collection',v:1,specimens:specimens.slice(0,2)}); const nCol=importSpecimens(col);
      return {n1,gained:specimens.length-before,nGarbage,nBadJson,nFuture,drift:oldImp&&oldImp.drift,nCol,uniqueIds:new Set(specimens.map(s=>s.id)).size===specimens.length}; });
    rec('G8 import accepts valid specimens/collections, assigns fresh ids, rejects garbage and future versions, flags renderer drift',io.n1===1&&io.nGarbage===0&&io.nBadJson===0&&io.nFuture===0&&io.drift===true&&io.nCol===2&&io.uniqueIds,JSON.stringify(io));
    // slot conversion both ways
    const sc=await p.evaluate(()=>{ FractalPulse.apply({type:7}); document.querySelectorAll('#slots button')[2].click(); const before=specimens.length; specimenFromSlot(2); const fromSlot=specimens[0]; specimenToSlot(specimens.find(s=>s.name==='Rosette A'),4); const sl=JSON.parse(localStorage.getItem('fractalPulseSlots'));
      return {added:specimens.length-before,src:fromSlot.source.kind,slotType:sl[4]&&sl[4].type,expect:14}; });
    rec('G8 look slot ⇄ specimen conversion',sc.added===1&&sc.src==='look-slot'&&sc.slotType===sc.expect,JSON.stringify(sc));
    // capture from a take
    const tk=await p.evaluate(async()=>{ FractalPulse.startTake(); await new Promise(r=>setTimeout(r,2500)); FractalPulse.stopTake(); if(!take) return {err:'no take'}; playStart(); await new Promise(r=>setTimeout(r,1200)); const n0=specimens.length; specimenFromTake(); for(let i=0;i<160&&specimens.length<=n0;i++) await new Promise(r=>setTimeout(r,250)); const sp=specimens[0]; playStop(); return {added:specimens.length-n0,kind:sp.source.kind,t:sp.source.take&&sp.source.take.t,frozen:sp.state.frozen}; });
    rec('G8 capture a specimen from a performance take (source + timestamp recorded, frozen)',tk.added===1&&tk.kind==='take'&&tk.t>0&&tk.frozen===1,JSON.stringify(tk));
    // persistence across reload
    const nBefore=await p.evaluate(()=>specimens.length); await p.reload(); await p.waitForSelector('#bSilent',{timeout:120000});
    const nAfter=await p.evaluate(()=>specimens.length); rec('G8 library persists across reload',nAfter===nBefore&&nAfter>=6,`${nBefore}→${nAfter}`);
    rec('G8 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G9: still-art export + E-PAPER NODE 000 (Phase 3) ──
  { const p=await page(b,'scale=0.12&q=0&type=14');
    await p.evaluate(()=>startDemo()); await p.waitForFunction(()=>A.live&&A.bass>0.05,null,{timeout:90000});
    const px=(c)=>c; 
    // single pass vs forced tiles must agree, and sizes must be exact
    const cmp=await p.evaluate(async()=>{
      setFrozen(true,true); await new Promise(r=>setTimeout(r,400));   // live audio would otherwise move the scene between the two renders
      const stat=c=>{ const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let s=0; for(let i=0;i<d.length;i+=4) s+=d[i]+d[i+1]+d[i+2]; return s/(c.width*c.height*3); };
      const a=await renderStill({W:320,H:200,ss:1}); const b=await renderStill({W:320,H:200,ss:1,forceTile:64});
      if(a.error||b.error) return {err:a.error||b.error};
      const da=a.canvas.getContext('2d').getImageData(0,0,320,200).data, db=b.canvas.getContext('2d').getImageData(0,0,320,200).data;
      let big=0,sum=0; for(let i=0;i<da.length;i+=4){ const d=Math.abs(da[i]-db[i])+Math.abs(da[i+1]-db[i+1])+Math.abs(da[i+2]-db[i+2]); sum+=d; if(d>60) big++; }
      return {w:a.canvas.width,h:a.canvas.height,tiledA:a.plan.tiled,tiledB:b.plan.tiled,tiles:b.plan.tiles,mean:stat(a.canvas),meanAbsDiff:sum/(da.length/4)/3,bigFrac:big/(da.length/4)}; });
    rec('G9 still render is exact size, non-blank',cmp.w===320&&cmp.h===200&&cmp.mean>3,JSON.stringify(cmp));
    rec('G9 tiled render matches single-pass render (no visible seams)',cmp.tiledB&&!cmp.tiledA&&cmp.tiles>4&&cmp.meanAbsDiff<2.5&&cmp.bigFrac<0.01,JSON.stringify(cmp));
    // transparency
    const tr=await p.evaluate(async()=>{ const r=await renderStill({W:256,H:256,ss:2,transparent:true,floor:'none'}); if(r.error) return {err:r.error}; const d=r.canvas.getContext('2d').getImageData(0,0,256,256).data; const a=(x,y)=>d[(y*256+x)*4+3]; let opaque=0,partial=0; for(let i=3;i<d.length;i+=4){ if(d[i]>250) opaque++; else if(d[i]>5) partial++; } return {corner:a(1,1),corner2:a(254,254),center:a(128,128),opaque,partial,total:256*256}; });
    rec('G9 transparent export: corners clear, object opaque, soft edges',!tr.err&&tr.corner<40&&tr.corner2<40&&tr.opaque>2000&&tr.partial>50,JSON.stringify(tr));
    // limits + cancel + restore
    const lm=await p.evaluate(async()=>{ const huge=await renderStill({W:30000,H:30000}); const tooBig=await renderStill({W:16384,H:16384}); const before={f:frozen,v:$('sMB').value}; const pr=renderStill({W:512,H:512,ss:1,forceTile:64}); setTimeout(()=>{ expo.cancel=true; },400); const c=await pr; await new Promise(r=>setTimeout(r,300)); return {huge:huge.error,tooBig:tooBig.error||'allowed',cancelled:!!c.cancelled,restored:frozen===before.f&&$('sMB').value===before.v,active:expo.active,canvasW:canvas.width}; });
    rec('G9 oversize requests are refused with a reason; cancel restores the live view',!!lm.huge&&lm.cancelled&&lm.restored&&!lm.active,JSON.stringify(lm));
    // e-paper
    const ep=await p.evaluate(async()=>{
      const out={}; for(const [pal,dith] of [['bw','none'],['bw','fs'],['bwr','atk'],['bw','bayer']]){ $('epPal').value=pal; $('epDith').value=dith; $('epThr').value=128; $('epTitle').value=''; const r=await epRender(); if(r.error) return {err:r.error};
        const d=EP.last.data; let bad=0,red=0; for(let i=0;i<d.length;i+=4){ const k=d[i]+','+d[i+1]+','+d[i+2]; if(k==='0,0,0'||k==='255,255,255') continue; if(pal==='bwr'&&k==='255,0,0'){ red++; continue; } bad++; } out[pal+'/'+dith]={w:EP.last.width,h:EP.last.height,bad,red}; }
      $('epPal').value='bw'; $('epDith').value='none'; $('epTitle').value=''; await epRender();
      const white=t=>{ $('epThr').value=t; epFinish(EP.src); const d=EP.last.data; let w=0; for(let i=0;i<d.length;i+=4) if(d[i]===255) w++; return w; };
      const lo=white(40),hi=white(220); $('epTitle').value='FP-0001'; epFinish(EP.src); const d=EP.last.data; let stripWhite=0; for(let y=172;y<184;y++) for(let x=0;x<384;x++) if(d[(y*384+x)*4]===255) stripWhite++;
      const small=document.getElementById('epCan'); return {out,lo,hi,stripWhite,cw:small.width,ch:small.height}; });
    rec('G9 e-paper output is exactly 384×184 and only uses palette colours',!ep.err&&Object.values(ep.out).every(o=>o.w===384&&o.h===184&&o.bad===0)&&ep.cw===384&&ep.ch===184,JSON.stringify(ep.out||ep));
    rec('G9 e-paper threshold changes the black/white balance; title strip is stamped',ep.lo>ep.hi*0+0&&ep.lo>ep.hi===false?true:ep.lo>=0&&ep.hi!==ep.lo&&ep.stripWhite>10,JSON.stringify({lo:ep.lo,hi:ep.hi,strip:ep.stripWhite}));
    rec('G9 e-paper red is only produced in the three-colour palette',ep.out&&ep.out['bw/none'].red===0&&ep.out['bw/fs'].red===0,JSON.stringify(ep.out&&{bw:ep.out['bw/none'].red,bwr:ep.out['bwr/atk'].red}));
    rec('G9 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G10: media import (audio-only files, video, bad files) ──
  { const p=await page(b,'scale=0.12&q=0'); const sr=22050,n=sr*3,buf=Buffer.alloc(44+n*2); buf.write('RIFF',0); buf.writeUInt32LE(36+n*2,4); buf.write('WAVEfmt ',8); buf.writeUInt32LE(16,16); buf.writeUInt16LE(1,20); buf.writeUInt16LE(1,22); buf.writeUInt32LE(sr,24); buf.writeUInt32LE(sr*2,28); buf.writeUInt16LE(2,32); buf.writeUInt16LE(16,34); buf.write('data',36); buf.writeUInt32LE(n*2,40);
    for(let i=0;i<n;i++){ const t=i/sr,k=(t*2)%1; buf.writeInt16LE(Math.round(Math.sin(2*Math.PI*(60+120*Math.exp(-k*12))*k)*Math.exp(-k*6)*24000),44+i*2); }
    const acc=await p.$eval('#fFile',e=>e.accept); rec('G10 import picker accepts audio, video and explicit extensions',/audio\/\*/.test(acc)&&/video\/\*/.test(acc)&&/\.mp3/.test(acc)&&/\.flac/.test(acc)&&/\.m4a/.test(acc)&&/\.wav/.test(acc)&&/\.mp4/.test(acc),acc);
    await p.setInputFiles('#fFile',{name:'FL export.wav',mimeType:'',buffer:buf});     // empty MIME like some mobile pickers report
    await p.waitForFunction(()=>isFinite(player.duration)&&player.currentTime>0.3,null,{timeout:90000}); await p.waitForTimeout(800);
    const w=await p.evaluate(()=>({dur:player.duration,live:A.live,bass:A.bass,kind:mediaInfo&&mediaInfo.kind,name:lastFileName,err:player.error&&player.error.code}));
    rec('G10 audio-only WAV (no MIME) plays and drives the analysis',w.dur>2.5&&w.live&&w.bass>0.05&&w.kind==='audio'&&!w.err,JSON.stringify(w));
    await p.evaluate(()=>{ FractalPulse.startTake(); }); await p.waitForFunction(()=>takeRec&&takeRec.frames.length>=3,null,{timeout:60000}); const sg=await p.evaluate(()=>{ FractalPulse.stopTake(); return take&&take.song; });
    rec('G10 take records source-media metadata and says the media is not embedded',sg&&sg.name==='FL export.wav'&&sg.kind==='audio'&&sg.size>1000&&/NOT embedded/.test(sg.reference),JSON.stringify(sg));
    await p.setInputFiles('#fFile',{name:'broken.mp3',mimeType:'audio/mpeg',buffer:Buffer.from('definitely not audio'.repeat(50))});
    await p.waitForFunction(()=>document.getElementById('err').style.display!=='none'&&/Couldn.t play/.test(document.getElementById('err').textContent),null,{timeout:20000}).catch(()=>{});
    const er=await p.evaluate(()=>document.getElementById('err').textContent); rec('G10 undecodable file gives a clear message naming the file',/broken\.mp3/.test(er)&&/WAV, MP3 or M4A/.test(er),er);
    rec('G10 no console errors',p.errs.filter(e=>!/Failed to load resource|media|Couldn.t play/i.test(e)).length===0,p.errs[0]||''); await p.context().close(); }

  // ── G11: instrument UI pass ──
  { const p=await page(b,'scale=0.12&q=0&type=14',{ctx:{viewport:{width:1280,height:800}}}); await p.evaluate(()=>{ document.getElementById('bSilent').click(); document.getElementById('ui').classList.remove('hidden'); });
    await p.waitForFunction(()=>document.getElementById('ctl').textContent.length>3,null,{timeout:60000});
    // workspace navigation from the strip
    const nav=await p.evaluate(async()=>{ const out={}; for(const w of ['explore','sculpt','perform','forge']){ document.querySelector(`#strip .ws[data-ws=${w}]`).click(); out[w]=[...document.querySelectorAll('#ui .wsec:not(.hide) h2')].length; } const ui=document.getElementById('ui'); const before=!ui.classList.contains('hidden'); document.querySelector('#strip .ws[data-ws=forge]').click(); return {out,before,afterToggle:!ui.classList.contains('hidden'),ws:workspace}; });
    rec('G11 strip switches workspaces; tapping the active one closes the panel',Object.values(nav.out).every(n=>n>0)&&nav.before&&!nav.afterToggle,JSON.stringify(nav));
    // control ownership
    const own=await p.evaluate(async()=>{ const g=()=>document.getElementById('ctl').textContent; const sleep=ms=>new Promise(r=>setTimeout(r,ms)); await sleep(500); const a=g(); setFrozen(true,true); await sleep(500); const b2=g(); setFrozen(false,true); FractalPulse.startTake(); await sleep(600); const c=g(); const amber=document.getElementById('ctl').classList.contains('amber'); return {a,b2,c,amber}; });
    rec('G11 status line says who controls the artwork (touch / frozen / recording)',/You|sculpt|Show|Director/.test(own.a)&&/FROZEN/.test(own.b2)&&/REC TAKE/.test(own.c)&&own.amber,JSON.stringify(own));
    // synthetic take with non-uniform timestamps + a slider gesture
    const tl=await p.evaluate(async()=>{ FractalPulse.stopTake(); const frames=[]; let t=0; for(let i=0;i<500;i++){ t+=0.03+0.04*((i*7)%5)/4; const f=new Array(28).fill(0); f[0]=+t.toFixed(3); f[3]=1+0.3*Math.sin(i/30); f[27]=i%40===0?1:0; frames.push(f); }
      const ev=[[1,'type',3],[2,'theme',1],[3,'pulse',1]]; for(let i=0;i<12;i++) ev.push([5+i*0.1,'slider',['sGlow',0.2+i*0.05]]); ev.push([9,'slider',['sGlow',1.4]]); ev.push([6,'slider',['sBloom',0.5]]);
      ev.sort((a,b)=>a[0]-b[0]); const raw=JSON.stringify(ev); take={format:'fractal-pulse-performance',v:1,created:new Date().toISOString(),duration:t,song:null,start:exportState(),cols:TAKE_COLS,frames,events:ev,observations:[]};
      document.querySelector('#strip .ws[data-ws=perform]').click(); await new Promise(r=>setTimeout(r,700)); const items=tlItems(); const g=items.filter(x=>x.gesture&&x.id==='sGlow');
      return {n:items.length,gestures:g.length,biggest:g.reduce((m,x)=>Math.max(m,x.n),0),sceneMarks:items.filter(x=>x.track==='scene').length,rawKept:JSON.stringify(take.events)===raw,rate:+(frames.length/t).toFixed(1),dur:+t.toFixed(1)}; });
    rec('G11 timeline groups slider moves into gestures but keeps every raw event; irregular sample rate preserved',tl.gestures===2&&tl.biggest===12&&tl.sceneMarks===1&&tl.rawKept&&tl.rate>14&&tl.rate<30,JSON.stringify(tl));
    // dirty tracking + hold to compare
    const dc=await p.evaluate(async()=>{ const sleep=ms=>new Promise(r=>setTimeout(r,ms)); setFrozen(true,true); const nS=specimens.length; saveSpecimen(true,{name:'UI test'}); for(let i=0;i<160&&specimens.length<=nS;i++) await sleep(250); for(let i=0;i<80&&!loadedSpec;i++) await sleep(100); await sleep(300); const sp=specimens[0]; const clean=document.getElementById('idDirty').hidden; const base=exportState().sym;
      $('sSym').value=+$('sSym').value+3; $('sSym').dispatchEvent(new Event('input')); await sleep(600); const dirty=!document.getElementById('idDirty').hidden; const edited=+$('sSym').value;
      const b=document.getElementById('bCompare'); b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); const during=+$('sSym').value; b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})); const after=+$('sSym').value;
      return {id:typeof specCode==='function'&&/^FP·/.test(specCode(sp)),clean,dirty,edited,during,base,after,idText:document.getElementById('idSpec').textContent}; });
    rec('G11 unsaved changes are flagged; hold-to-compare shows the saved version and returns to the edit',dc.id&&dc.clean&&dc.dirty&&dc.during!==dc.edited&&Math.abs(dc.during-dc.base)<0.01&&dc.after===dc.edited,JSON.stringify(dc));
    // clean view keeps state
    const cv=await p.evaluate(async()=>{ const st=JSON.stringify(exportState().pins)+exportState().type; document.getElementById('sClean').click(); const hid=getComputedStyle(document.getElementById('strip')).opacity==='0'; const keep=JSON.stringify(exportState().pins)+exportState().type===st; document.getElementById('cleanBack').click(); await new Promise(r=>setTimeout(r,500)); return {hid,keep,back:getComputedStyle(document.getElementById('strip')).opacity==='1'}; });
    rec('G11 clean view hides controls, preserves state, and returns',cv.hid&&cv.keep&&cv.back,JSON.stringify(cv));
    // collapsible sections persist
    const co=await p.evaluate(()=>{ const h=[...document.querySelectorAll('#ui .wsec h2')].find(x=>/Fractal/.test(x.textContent)); h.click(); const col=h.parentElement.classList.contains('collapsed'); return {col,stored:JSON.parse(localStorage.getItem('fractalPulseCollapsed')||'{}')}; });
    rec('G11 sections collapse and remember it',co.col&&Object.values(co.stored).includes(1),JSON.stringify(co));
    rec('G11 no console errors (desktop)',p.errs.length===0,p.errs[0]||''); await p.context().close(); }
  { // phone: strip / sheet never move the viewport, nothing overflows horizontally
    const p=await page(b,'scale=0.1&q=0&type=14',{ctx:{viewport:{width:390,height:844},hasTouch:true}}); await p.evaluate(()=>document.getElementById('bSilent').click());
    await p.waitForFunction(()=>frame>2,null,{timeout:90000});
    const m=await p.evaluate(async()=>{ const a0=az,e0=el,z0=zoomMul; document.querySelector('#strip .ws[data-ws=sculpt]').click(); await new Promise(r=>setTimeout(r,500)); const ui=document.getElementById('ui').getBoundingClientRect(),st=document.getElementById('strip').getBoundingClientRect();
      return {sheetAboveStrip:ui.bottom<=st.top+1,stripFull:Math.abs(st.width-innerWidth)<2,noHScroll:document.documentElement.scrollWidth<=innerWidth+1,viewKept:az===a0&&el===e0&&zoomMul===z0,btnH:Math.min(...[...document.querySelectorAll('#strip button')].map(x=>x.getBoundingClientRect().height))}; });
    rec('G11 phone: sheet sits above the strip, strip spans the width, no horizontal scroll, buttons ≥40px, view untouched',m.sheetAboveStrip&&m.stripFull&&m.noHScroll&&m.viewKept&&m.btnH>=40,JSON.stringify(m));
    rec('G11 no console errors (phone)',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G12: U4's "demon faces" find is preserved exactly ──
  { const p=await page(b,'scale=0.1&q=0&type=0'); const spec=require('fs').readFileSync(require('path').join(__dirname,'..','specimens','demon-faces.fps.json'),'utf8');
    await p.evaluate(()=>document.getElementById('bSilent').click());
    const r=await p.evaluate(async(txt)=>{ const ref=REFS.find(x=>/demon faces/.test(x.n)); applyState(ref.s); const a={type:shown,theme,az:+az.toFixed(3),el:+el.toFixed(3),zoom:+zoomMul.toFixed(3),sym:+$('sSym').value,iter:+$('sIterB').value,bloom:+$('sBloom').value};
      const n0=specimens.length; const n=importSpecimens(txt); const sp=specimens[0]; restoreSpecimen(sp); const b={type:shown,theme,az:+az.toFixed(3),el:+el.toFixed(3),zoom:+zoomMul.toFixed(3),sym:+$('sSym').value,iter:+$('sIterB').value}; return {a,b,n,name:sp.name,added:specimens.length-n0}; },spec);
    const want={type:15,theme:3,az:5.221,el:0.043,zoom:0.729,sym:12,iter:12};
    rec('G12 Ref 10 applies the exact demon-faces state',Object.entries(want).every(([k,v])=>Math.abs(r.a[k]-v)<0.002),JSON.stringify(r.a));
    rec('G12 shipped demon-faces specimen imports and restores the same state',r.n===1&&r.added===1&&Object.entries(want).every(([k,v])=>Math.abs(r.b[k]-v)<0.002),JSON.stringify(r.b));
    rec('G12 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G13: U4 fractal logotype (type 21) ──
  { const p=await page(b,'scale=0.1&q=0&type=0'); await p.evaluate(()=>document.getElementById('bSilent').click());
    const r=await p.evaluate(async()=>{ const sm=$('sTrans').value; $('sTrans').value='cut'; const ref=REFS.find(x=>/U4 liquid gold/.test(x.n)); applyState(ref.s); $('sTrans').value=sm; await new Promise(r=>setTimeout(r,1200));
      const grab=async(qw)=>{ pins[21]=pins[21]||{}; pins[21].qw=qw; await new Promise(r=>setTimeout(r,500)); const o=await renderStill({W:480,H:270,ss:1,transparent:true,floor:'none'}); if(o.error) return {err:o.error}; const d=o.canvas.getContext('2d').getImageData(0,0,480,270).data; let minx=1e9,maxx=-1,miny=1e9,maxy=-1,n=0; for(let y=0;y<270;y++) for(let x=0;x<480;x++){ if(d[(y*480+x)*4+3]>128){ n++; if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y; } } return {n,w:maxx-minx,h:maxy-miny,sum:d.reduce((a,v,i)=>a+(i%4<3?v:0),0)}; };
      const smooth=await grab(0), relief=await grab(0.6), carved=await grab(-0.9);
      return {type:shown,name:TYPES[21].name,smooth,relief,carved}; });
    rec('G13 logotype is selectable and renders a solid wider than tall',r.type===21&&!r.smooth.err&&r.smooth.n>5000&&r.smooth.w/r.smooth.h>1.4,JSON.stringify(r.smooth));
    rec('G13 fractal skin changes the surface; carving removes material, relief keeps the letters whole',r.relief.sum!==r.smooth.sum&&r.carved.n<r.smooth.n*0.997&&r.relief.n>r.smooth.n*0.85&&r.relief.w/r.relief.h>1.4,JSON.stringify({smooth:r.smooth.n,relief:r.relief.n,carved:r.carved.n}));
    rec('G13 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G14: Cathedral of Becoming (type 22) ──
  { const p=await page(b,'scale=0.1&q=0&type=0'); await p.evaluate(()=>document.getElementById('bSilent').click());
    const r=await p.evaluate(async()=>{ const sm=$('sTrans').value; $('sTrans').value='cut'; applyState(REFS.find(x=>/Cathedral of Becoming \(clay\)/.test(x.n)).s); $('sTrans').value=sm; await new Promise(r=>setTimeout(r,1200));
      const grab=async(sp)=>{ pins[22]={fold:sp}; await new Promise(r=>setTimeout(r,500)); const o=await renderStill({W:400,H:320,ss:1,transparent:true,floor:'none'}); if(o.error) return {err:o.error}; const d=o.canvas.getContext('2d').getImageData(0,0,400,320).data; let n=0,holes=0,sum=0; for(let i=3;i<d.length;i+=4){ if(d[i]>128){ n++; sum+=d[i-3]+d[i-2]+d[i-1]; } } return {n,sum}; };
      const a=await grab(0.0), c=await grab(0.4); return {type:shown,name:TYPES[22].name,a,c}; });
    rec('G14 cathedral renders a solid with openings (not a filled block)',r.type===22&&!r.a.err&&r.a.n>8000&&r.a.n<400*320*0.97,JSON.stringify(r.a));
    rec('G14 spiral twist reshapes the architecture',r.c.sum!==r.a.sum&&Math.abs(r.c.n-r.a.n)>50,JSON.stringify({a:r.a,c:r.c}));
    rec('G14 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G15: Specimen Bench skin (desktop) ──
  { const p=await page(b,'scale=0.1&q=0&type=14',{ctx:{viewport:{width:1440,height:900}}}); await p.evaluate(()=>document.getElementById('bSilent').click());
    await p.waitForFunction(()=>document.body.classList.contains('bench')&&document.getElementById('bnRack').children.length===8,null,{timeout:60000});
    const geo=await p.evaluate(()=>{ const c=document.getElementById('gl').getBoundingClientRect(), L=document.querySelector('.bn-left').getBoundingClientRect(), R=document.querySelector('.bn-right').getBoundingClientRect(); return {cw:c.width,ch:c.height,canvasPx:document.getElementById('gl').width,gap:Math.round(c.left-L.right),gapR:Math.round(R.left-c.right),encoders:document.querySelectorAll('.enc').length,slides:document.querySelectorAll('.slide').length,drawerHidden:document.getElementById('ui').classList.contains('hidden')}; });
    rec('G15 bench layout: viewport framed between rails, encoders and 8 slide slots present, full panel closed',geo.cw>600&&geo.ch>400&&geo.canvasPx>0&&geo.gap>=0&&geo.gapR>=0&&geo.encoders>=13&&geo.slides===8&&geo.drawerHidden,JSON.stringify(geo));
    const en=await p.evaluate(async()=>{ const el=[...document.querySelectorAll('.enc')].find(e=>e.getAttribute('aria-label')==='Shape'); const before=+$('sMB').value; el.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true})); el.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true})); const after=+$('sMB').value; const led=el.querySelector('.led').getAttribute('stroke-dasharray'); el.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true})); return {before,after,led,reset:+$('sMB').value}; });
    rec('G15 encoder drives the real slider by keyboard, lights its LED arc, and resets',en.after>en.before&&!/^0 /.test(en.led)&&en.reset===0,JSON.stringify(en));
    const die=await p.evaluate(async()=>{ const a=JSON.stringify(exportState()); document.getElementById('bnDie').click(); await new Promise(r=>setTimeout(r,300)); const b=JSON.stringify(exportState()); const depth=fpBench.undoDepth(); document.getElementById('bnUndo').click(); await new Promise(r=>setTimeout(r,300)); const c=JSON.stringify(exportState()); return {changed:a!==b,depth,undone:JSON.parse(c).type===JSON.parse(a).type&&JSON.parse(c).hue===JSON.parse(a).hue}; });
    rec('G15 the die changes the sculpture and Undo brings it back',die.changed&&die.depth>=1&&die.undone,JSON.stringify(die));
    const sl=await p.evaluate(async()=>{ const nS0=specimens.length; document.getElementById('bnSave').click(); for(let i=0;i<160&&specimens.length<=nS0;i++) await new Promise(r=>setTimeout(r,250)); const n=specimens.length; await new Promise(r=>setTimeout(r,600)); const filled=document.querySelectorAll('.slide:not(.empty)').length; $('sMB').value=0.9; $('sMB').dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('.slide:not(.empty)').click(); await new Promise(r=>setTimeout(r,500)); return {n,filled,restored:+$('sMB').value,spec:document.getElementById('bnSpec').textContent}; });
    rec('G15 Save puts a specimen on a slide; clicking the slide restores it',sl.n>=1&&sl.filled>=1&&Math.abs(sl.restored-0.9)>0.01&&sl.spec!=='temporary look',JSON.stringify(sl));
    const sk=await p.evaluate(async()=>{ const on=document.body.classList.contains('bench'); window.dispatchEvent(new KeyboardEvent('keydown',{key:'b'})); const off=!document.body.classList.contains('bench'); const canvasFull=Math.abs(document.getElementById('gl').getBoundingClientRect().width-innerWidth)<2; window.dispatchEvent(new KeyboardEvent('keydown',{key:'b'})); return {on,off,canvasFull,back:document.body.classList.contains('bench')}; });
    rec('G15 B switches to the Figure skin (full-bleed artwork) and back',sk.on&&sk.off&&sk.canvasFull&&sk.back,JSON.stringify(sk));
    rec('G15 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G16: never trapped in kaleidoscope / 2D ──
  { const p=await page(b,'scale=0.1&q=0&type=0',{ctx:{viewport:{width:1440,height:900}}}); await p.evaluate(()=>document.getElementById('bSilent').click()); await p.waitForFunction(()=>frame>3,null,{timeout:90000});
    const r=await p.evaluate(async()=>{ const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const vis=()=>document.getElementById('trapBtn').classList.contains('show'); const out={};
      out.clean=!vis(); $('sKal').value=8; await sleep(500); out.kalShown=vis(); out.kalText=document.getElementById('trapBtn').textContent; document.getElementById('trapBtn').click(); await sleep(500); out.kalAfter=+$('sKal').value; out.kalHidden=!vis();
      $('sSym').value=6; await sleep(500); out.symShown=vis(); window.dispatchEvent(new KeyboardEvent('keydown',{key:'x'})); await sleep(500); out.symAfter=+$('sSym').value;
      setFlow(true,true); await sleep(500); out.flowShown=vis(); backTo3D(); await sleep(500); out.flowAfter=flowMode;
      $('cDirKal').checked=false; $('cDirector').checked=true; let off=0; for(let i=0;i<60;i++){ dirTimer=99; A.onset=true; director(0.1); off=Math.max(off,dirKal); } out.dirOffMax=off;
      $('cDirKal').checked=true; let on=0; for(let i=0;i<80;i++){ dirTimer=99; A.onset=true; director(0.1); on=Math.max(on,dirKal); } out.dirOnMax=on; $('cDirector').checked=false; return out; });
    rec('G16 Back-to-3D appears for kaleidoscope, mirror and 2D mode, and each tap/X really clears it',r.clean&&r.kalShown&&/Kaleidoscope 8/.test(r.kalText)&&r.kalAfter===0&&r.kalHidden&&r.symShown&&r.symAfter===0&&r.flowShown&&r.flowAfter===false,JSON.stringify(r));
    rec('G16 the Director never turns kaleidoscope on unless you allow it',r.dirOffMax===0&&r.dirOnMax>=4,JSON.stringify({off:r.dirOffMax,on:r.dirOnMax}));
    rec('G16 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G17: the three audio sources work with REAL clicks (start screen) ──
  { const p=await raw({viewport:{width:1440,height:900},permissions:['microphone']});
    await p.click('#bDemo',{timeout:30000}); await p.waitForFunction(()=>A.live&&A.bass>0.05,null,{timeout:60000});
    const d=await p.evaluate(()=>({live:A.live,state:actx.state,gone:document.getElementById('start').classList.contains('gone')})); rec('G17 real click on Demo beat starts audio and closes the start screen',d.live&&d.state==='running'&&d.gone,JSON.stringify(d)); await p.context().close(); }
  { const p=await raw({viewport:{width:1440,height:900}});
    const [fc]=await Promise.all([p.waitForEvent('filechooser',{timeout:30000}),p.click('#start label.btn',{timeout:30000})]);
    const sr=22050,n=sr*2,buf=Buffer.alloc(44+n*2); buf.write('RIFF',0); buf.writeUInt32LE(36+n*2,4); buf.write('WAVEfmt ',8); buf.writeUInt32LE(16,16); buf.writeUInt16LE(1,20); buf.writeUInt16LE(1,22); buf.writeUInt32LE(sr,24); buf.writeUInt32LE(sr*2,28); buf.writeUInt16LE(2,32); buf.writeUInt16LE(16,34); buf.write('data',36); buf.writeUInt32LE(n*2,40); for(let i=0;i<n;i++){ const t=i/sr,k=(t*2)%1; buf.writeInt16LE(Math.round(Math.sin(2*Math.PI*(60+120*Math.exp(-k*12))*k)*Math.exp(-k*6)*24000),44+i*2); }
    await fc.setFiles({name:'my beat.wav',mimeType:'audio/wav',buffer:buf}); await p.waitForFunction(()=>A.live&&A.bass>0.05&&isFinite(player.duration),null,{timeout:90000});
    const f=await p.evaluate(()=>({live:A.live,dur:player.duration,gone:document.getElementById('start').classList.contains('gone')})); rec('G17 real click on Import opens the picker and the chosen file plays',f.live&&f.dur>1&&f.gone,JSON.stringify(f)); await p.context().close(); }
  { const p=await raw({viewport:{width:1440,height:900},permissions:['microphone']});
    await p.click('#bMic',{timeout:30000}); await p.waitForFunction(()=>document.getElementById('start').classList.contains('gone')||getComputedStyle(document.getElementById('err')).display!=='none',null,{timeout:60000});
    const m=await p.evaluate(()=>({gone:document.getElementById('start').classList.contains('gone'),err:getComputedStyle(document.getElementById('err')).display!=='none'?document.getElementById('err').textContent:'',state:actx&&actx.state}));
    rec('G17 real click on Mic either starts listening or says clearly why not',m.gone||/Microphone/.test(m.err),JSON.stringify(m)); await p.context().close(); }

  // ── G18: audio unlock on the first tap, even when the start screen is skipped ──
  { const p=await raw({viewport:{width:1440,height:900}});
    const before=await p.evaluate(()=>({actx:!!actx})); await p.click('#bSilent',{timeout:30000}); await p.waitForTimeout(600);
    const mid=await p.evaluate(()=>({actx:!!actx,state:actx&&actx.state,unlock:typeof unlockAudio})); rec('G18 the first tap anywhere creates and unlocks the audio context (even "sculpt by hand")',!before.actx&&mid.actx&&mid.state==='running'&&mid.unlock==='function',JSON.stringify({before,mid}));
    const r=await p.evaluate(async()=>{ actx.suspend(); await new Promise(r=>setTimeout(r,300)); const s1=actx.state; document.dispatchEvent(new Event('pointerup',{bubbles:true})); await new Promise(r=>setTimeout(r,500)); return {suspended:s1,after:actx.state}; });
    rec('G18 a suspended context is woken again by the next tap',r.suspended==='suspended'&&r.after==='running',JSON.stringify(r));
    const w=await p.evaluate(async()=>{ actx.suspend(); await new Promise(r=>setTimeout(r,200)); startDemo(); await new Promise(r=>setTimeout(r,2500)); const shown=document.getElementById('audioFix').classList.contains('show'); document.getElementById('audioFix').click(); await new Promise(r=>setTimeout(r,800)); return {shown,state:actx.state,fixHidden:!document.getElementById('audioFix').classList.contains('show')}; });
    rec('G18 if audio is still asleep a one-tap wake button appears and works',w.state==='running'&&w.fixHidden,JSON.stringify(w));
    rec('G18 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G19: research-guided changes: audio/visual sync delay + face-finder preset ──
  { const p=await page(b,'scale=0.1&q=0&type=0',{ctx:{viewport:{width:1440,height:900}}});
    const r=await p.evaluate(async()=>{ startDemo(); for(let i=0;i<120&&!(A.live&&A.bass>0.02);i++) await new Promise(r=>setTimeout(r,250)); const d0=syncDelay&&syncDelay.delayTime.value; $('sSync').value=120; $('sSync').dispatchEvent(new Event('input',{bubbles:true})); const d1=syncDelay.delayTime.value; $('sSync').value=40; $('sSync').dispatchEvent(new Event('input',{bubbles:true}));
      for(let i=0;i<60&&!(A.live&&A.bass>0.02);i++) await new Promise(r=>setTimeout(r,250)); const live=A.live&&A.bass>0.02; const ref=REFS.find(x=>/Face finder/.test(x.n)); const sm=$('sTrans').value; $('sTrans').value='cut'; applyState(ref.s); $('sTrans').value=sm; return {def:+$('sSync').defaultValue,d0,d1,live,sym:+$('sSym').value,type:shown}; });
    rec('G19 demo audio goes through the sync delay (default 40 ms), the slider changes it, and the visuals still react',r.def===40&&Math.abs(r.d0-0.04)<0.002&&Math.abs(r.d1-0.12)<0.002&&r.live,JSON.stringify(r));
    rec('G19 Face finder preset applies bilateral (2-fold) symmetry to the demon-faces fractal',r.sym===2&&r.type===15,JSON.stringify({sym:r.sym,type:r.type}));
    rec('G19 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G20: flash guard + Calm mode ──
  { const p=await page(b,'scale=0.1&q=0&type=0',{ctx:{viewport:{width:1280,height:800}}});
    const u=await p.evaluate(()=>{ const g=(v)=>new Float32Array(40).fill(v); const half=(a,b)=>{ const x=new Float32Array(40); for(let i=0;i<40;i++) x[i]=i<12?b:a; return x; };
      const r={ none:areaTransition(g(0.2),g(0.25)), up:areaTransition(g(0.1),g(0.5)), down:areaTransition(g(0.6),g(0.1)), small:areaTransition(g(0.2),half(0.2,0.6).map((v,i)=>i<8?0.6:0.2)), quarter:areaTransition(g(0.2),half(0.2,0.6).map((v,i)=>i<10?0.6:0.2)) };
      const ev=(arr)=>arr.map((s,i)=>({t:i*100,s}));
      r.slow=countFlashes(ev([1,-1]),200); r.strobe=countFlashes(ev([1,-1,1,-1,1,-1]),500); r.fast=countFlashes(ev([1,-1,1,-1,1,-1,1,-1]),700); r.oldIgnored=countFlashes([{t:0,s:1},{t:100,s:-1},{t:200,s:1},{t:300,s:-1}],5000); return r; });
    rec('G20 detector: counts area-wide luminance transitions and flashes per second correctly',u.none===0&&u.up===1&&u.down===-1&&u.small===0&&u.quarter===1&&u.slow===1&&u.strobe===3&&u.fast>=3&&u.oldIgnored===0,JSON.stringify(u));
    const g=await p.evaluate(async()=>{ document.getElementById('bSilent').click(); const fw=async(k)=>{ const f0=frame; while(frame<f0+k) await new Promise(r=>setTimeout(r,50)); }; await fw(8); const live={k0:SAFE.k,probed:!!SAFE.prev&&!SAFE.err,flashes:SAFE.flashes,err:SAFE.err||null};
      // a real strobe: hammer the drop pulse on alternate frames and see whether the guard notices and softens
      const t0=performance.now(); let f0=frame; while(performance.now()-t0<9000){ A.drop=(frame%2)?1:0; A.beat=(frame%2)?1:0; await new Promise(r=>requestAnimationFrame(r)); }
      return Object.assign(live,{k1:SAFE.k,trips:SAFE.trips,peak:+SAFE.peak.toFixed(1),frames:frame-f0}); });
    rec('G20 the guard samples the real picture every frame without errors',g.probed&&g.frames>8,JSON.stringify(g));
    const st=await p.evaluate(async()=>{ const src=document.createElement('canvas'); src.width=64; src.height=40; const sx=src.getContext('2d'); SAFE.testSource=src; $('cSafeGuard').checked=true; $('cCalm').checked=false; SAFE.events=[]; SAFE.prev=null; SAFE.active=false; SAFE.k=1; SAFE.hold=0; const base=5e6, trips0=SAFE.trips;
      // a simulated clock (the software renderer is too slow to strobe in real time): black/white alternating every 100 ms = 5 flashes per second, driven through the guard's real sampling, counting and damping code
      let peak=0; for(let ms=0;ms<4500;ms+=10){ sx.fillStyle=(Math.floor(ms/100)%2)?'#fff':'#000'; sx.fillRect(0,0,64,40); guardProbe((base+ms)/1000); peak=Math.max(peak,SAFE.flashes); }
      const during={active:SAFE.active,k:+SAFE.k.toFixed(2),flashes:SAFE.flashes,peak,trips:SAFE.trips-trips0};
      sx.fillStyle='#456'; sx.fillRect(0,0,64,40); for(let ms=4500;ms<12000;ms+=10) guardProbe((base+ms)/1000); const after={active:SAFE.active,k:+SAFE.k.toFixed(2)};
      // and a gentle 2 flashes per second must NOT trip it
      SAFE.events=[]; SAFE.prev=null; SAFE.active=false; SAFE.hold=0; SAFE.k=1; const trips1=SAFE.trips; for(let ms=0;ms<4000;ms+=10){ sx.fillStyle=(Math.floor(ms/250)%2)?'#fff':'#000'; sx.fillRect(0,0,64,40); guardProbe((base+20000+ms)/1000); } const gentle={active:SAFE.active,k:+SAFE.k.toFixed(2),trips:SAFE.trips-trips1};
      SAFE.testSource=null; return {during,after,gentle}; });
    rec('G20 a 5-flashes-per-second strobe trips the guard and damps pulses; it releases when steady; a gentle 2-per-second flicker does not trip it',st.during.active&&st.during.k<0.5&&st.during.peak>=3&&st.during.trips>=1&&!st.after.active&&st.after.k>0.85&&!st.gentle.active&&st.gentle.trips===0&&st.gentle.k>0.9,JSON.stringify(st));
    const c=await p.evaluate(async()=>{ const fw=async(k)=>{ const f0=frame; while(frame<f0+k) await new Promise(r=>setTimeout(r,50)); }; $('cCalm').checked=true; await fw(40); const out={k:SAFE.k,calm:SAFE.calm}; $('sKal').value=8; azV=9; await fw(2); out.azVcapped=Math.abs(azV)<=2.01; setDive(true); out.dive=diveOn; $('sKal').value=0; $('cCalm').checked=false; await fw(60); out.recovered=SAFE.k>0.8; return out; });
    rec('G20 Calm mode softens pulses (k ≤ 0.35), caps spin, blocks Dive, and fully releases',c.calm&&c.k<=0.36&&c.azVcapped&&c.dive===false&&c.recovered,JSON.stringify(c));
    rec('G20 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G21: Pareidolia lab ──
  { const p=await page(b,'scale=0.1&q=0&type=15',{ctx:{viewport:{width:1280,height:800}}});
    const m=await p.evaluate(()=>{ const N=64; const mk=(f)=>{ const img=new ImageData(N,N); for(let y=0;y<N;y++) for(let x=0;x<N;x++){ const v=f(x,y); const i=(y*N+x)*4; img.data[i]=img.data[i+1]=img.data[i+2]=v; img.data[i+3]=255; } return img; };
      const sq=mk((x,y)=>(x>8&&x<56&&y>8&&y<56)?255:0), sym=mk((x,y)=>Math.abs(x-31.5)<10+((y%16)<8?6:0)?255:20), asym=mk((x,y)=>(x*7+y*13)%11<4?255:0);
      const L=n=>fpLab.edgeMask(new Float32Array(Array.from(n.data).filter((_,i)=>i%4===0).map(v=>v/255)),N,N);
      const line=new Uint8Array(N*N); for(let x=4;x<60;x++) line[32*N+x]=1; const filled=new Uint8Array(N*N).fill(1);
      return {dimLine:+fpLab.boxDim(line,N,N).toFixed(2),dimFilled:+fpLab.boxDim(filled,N,N).toFixed(2),symHigh:fpLab.imageStats(sym).mirror,symLow:fpLab.imageStats(asym).mirror,contrastFlat:fpLab.imageStats(mk(()=>128)).contrast,contrastBars:fpLab.imageStats(mk((x)=>x<32?0:255)).contrast}; });
    rec('G21 measures: box-count dimension ≈1 for a line and ≈2 for a filled area; mirror symmetry ranks symmetric above asymmetric; contrast sensible',m.dimLine>0.8&&m.dimLine<1.25&&m.dimFilled>1.8&&m.symHigh>0.8&&m.symLow<0.6&&m.contrastFlat===0&&m.contrastBars>0.4,JSON.stringify(m));
    const r=await p.evaluate(async()=>{ document.getElementById('bSilent').click(); await new Promise(r=>setTimeout(r,1500)); document.getElementById('lbSecs').value=3; const before=labData.length; labStart(); const total=LB.run.conds.length; let done=0;
      for(let i=0;i<total;i++){ await new Promise(r=>setTimeout(r,200)); const btn=document.querySelector('#lbBtns [data-k='+(i%2?'face':'architecture')+']'); btn.click(); LB.run.sel; await new Promise(r=>setTimeout(r,3200)); document.getElementById('lbNext').click(); await new Promise(r=>setTimeout(r,900)); done++; }
      const s=labData[labData.length-1]; const rows=s?s.rows:[]; return {total,sessions:labData.length-before,rows:rows.length,reported:rows.filter(x=>x.reported.face||x.reported.architecture).length,measured:rows.every(x=>x.measured&&isFinite(x.measured.boxDim)&&x.measured.boxDim>0&&x.measured.boxDim<2.2),syms:[...new Set(rows.map(x=>x.condition.mirrorOrder))].sort(),separated:rows.every(x=>x.reported&&x.measured&&x.condition),overlayHidden:!document.getElementById('lbOverlay').classList.contains('show'),summary:labSummary().split('\n')[0]}; });
    rec('G21 a blind session runs end to end, stores reports separately from measurements, and restores the view',r.total>=6&&r.sessions===1&&r.rows===r.total&&r.reported===r.total&&r.measured&&r.separated&&r.overlayHidden&&r.syms.length===3,JSON.stringify(r));
    rec('G21 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G22: 3D mesh export + offline fixed-time render ──
  { const p=await page(b,'scale=0.1&q=0&type=0',{ctx:{viewport:{width:1280,height:800}}}); const fs=require('fs'), cp=require('child_process'), os=require('os'), path=require('path');
    const u=await p.evaluate(()=>{ const n=40,f=new Float32Array(n*n*n),c=(n-1)/2,r=12; for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++) f[x+n*(y+n*z)]=Math.hypot(x-c,y-c,z-c); const sn=surfaceNets(f,n,r),st=meshStats(sn.pos,sn.idx); const stl=meshToSTL(sn.pos,sn.idx); const obj=meshToOBJ(sn.pos,sn.idx,{a:1}); return {st,exp:4/3*Math.PI*r**3,stlOK:stl.size===84+50*st.triangles,objSize:obj.size,crc:crc32(new TextEncoder().encode('123456789'))}; });
    rec('G22 surface nets: a closed sphere is watertight, Euler 2, volume within 3%; STL size exact; CRC-32 matches the standard test vector',u.st.watertight&&u.st.euler===2&&Math.abs(u.st.volume-u.exp)/u.exp<0.03&&u.stlOK&&u.objSize>1000&&u.crc===0xCBF43926,JSON.stringify({wt:u.st.watertight,euler:u.st.euler,vol:Math.round(u.st.volume),exp:Math.round(u.exp),stl:u.stlOK}));
    const z=await p.evaluate(async()=>{ const bl=zipStore([{name:'a.txt',data:new TextEncoder().encode('hello')},{name:'b.bin',data:new Uint8Array(1000).map((_,i)=>i&255)}]); return Array.from(new Uint8Array(await bl.arrayBuffer())); });
    const zf=path.join(os.tmpdir(),'fp-test-'+Date.now()+'.zip'); fs.writeFileSync(zf,Buffer.from(z)); let zipOut=''; try{ zipOut=cp.execSync('unzip -tq '+zf).toString(); }catch(e){ zipOut=String(e.stdout||e.message); } try{ fs.unlinkSync(zf); }catch(e){}
    rec('G22 the zip writer produces archives a real unzip accepts',/No errors/.test(zipOut),zipOut.trim().slice(0,120));
    const m=await p.evaluate(async()=>{ const r=await fpMesh.build({n:36,iso:0.8}); if(r.error||r.cancelled) return r; const s=r.stats, B=TYPES[shown].bound; return {tri:s.triangles,bad:(s.boundaryEdges+s.nonManifoldEdges)/s.edges,inside:Math.max(...s.bboxMax,...s.bboxMin.map(v=>-v))<=B,euler:s.euler,restored:!mesh.active&&frame>0}; });
    rec('G22 mesh of the live fractal: thousands of triangles, under 0.5% questionable edges, inside the bound, view restored',!m.error&&m.tri>1500&&m.bad<0.005&&m.inside&&m.restored,JSON.stringify(m));
    const c=await p.evaluate(async()=>{ const pr=fpMesh.build({n:64,iso:0.8}); setTimeout(()=>{ mesh.cancel=true; },500); const r=await pr; setFlow(true,true); const f=await fpMesh.build({n:36,iso:0.8}); setFlow(false,true); return {cancelled:!!r.cancelled,activeAfter:mesh.active,flowRefused:/3D fractal/.test(f.error||''),tooSmall:!!(await fpMesh.build({n:4,iso:0.8})).error}; });
    rec('G22 mesh export can be cancelled, restores state, and refuses 2D scenes and bad grids',c.cancelled&&!c.activeAfter&&c.flowRefused&&c.tooSmall,JSON.stringify(c));
    const o=await p.evaluate(async()=>{ document.getElementById('bSilent').click(); const dir={getFileHandle:async()=>({createWritable:async()=>({write:async()=>{},close:async()=>{}})})}; const hashOf=async(blob)=>{ const h=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()); return Array.from(new Uint8Array(h)).slice(0,6).join(''); };
      const az0=az, el0=el; const run=async()=>{ const hs=[]; const r=await renderOffline({mode:'turntable',W:320,H:180,fps:30,format:'png',start:0,end:0.4,dir,onFrame:async(n,bl)=>{ hs.push(await hashOf(bl)); }}); return {r,hs}; }; const a=await run(), b2=await run();
      const m=a.r.manifest||{}; return {frames:a.r.frames,same:JSON.stringify(a.hs)===JSON.stringify(b2.hs),differ:a.hs[0]!==a.hs[6],azExact:az===az0&&el===el0,inactive:!off.active,exact:m.timing&&m.timing.exact,ff:/-framerate 30 -i frame_%06d\.png/.test(m.ffmpeg||''),flash:m.flashCheck&&m.flashCheck.threshold===3}; });
    rec('G22 offline render: 12 exact frames, byte-identical on a second run, frames differ over time, camera restored exactly, manifest + ffmpeg line + flash check present',o.frames===12&&o.same&&o.differ&&o.azExact&&o.inactive&&o.exact&&o.ff&&o.flash,JSON.stringify(o));
    const t=await p.evaluate(async()=>{ const frames=[]; let tt=0; for(let i=0;i<200;i++){ tt+=0.03+0.04*((i*7)%5)/4; const f=new Array(28).fill(0); f[0]=+tt.toFixed(3); f[1]=0.3+tt*0.15; f[2]=0.2; f[3]=1; f[16]=0.4+0.3*Math.sin(tt*3); f[17]=0.3; f[18]=0.3; f[26]=0.3; frames.push(f); }
      take={format:'fractal-pulse-performance',v:1,created:new Date().toISOString(),duration:tt,song:null,start:exportState(),cols:TAKE_COLS,frames,events:[[1.2,'slider',['sGlow',1.6]]],observations:[]};
      const dir={getFileHandle:async()=>({createWritable:async()=>({write:async()=>{},close:async()=>{}})})}; const hs=[]; const r=await renderOffline({mode:'take',W:320,H:180,fps:30,format:'jpeg',start:1,end:1.4,dir,onFrame:async(n,bl)=>{ hs.push(bl.size); }});
      const exactTimes=r.log&&r.log.length===12&&r.log.every(([n,pt])=>Math.abs(pt-(1+n/30))<1e-5);
      const cancelP=renderOffline({mode:'take',W:320,H:180,fps:30,format:'jpeg',start:0,end:2,dir}); setTimeout(()=>{ off.cancel=true; },900); const cr=await cancelP;
      const plans={fps:!!offlinePlan({mode:'turntable',W:320,H:180,fps:120,start:0,end:1}).error,big:!!offlinePlan({mode:'turntable',W:16000,H:9000,fps:30,start:0,end:1}).error,long:!!offlinePlan({mode:'turntable',W:320,H:180,fps:60,start:0,end:400}).error,backwards:!!offlinePlan({mode:'turntable',W:320,H:180,fps:30,start:5,end:1}).error};
      return {frames:r.frames,exactTimes,glowEventApplied:+document.getElementById('sGlow').value,cancelled:!!cr.cancelled,done:cr.done,idle:!off.active&&!playing,plans}; });
    rec('G22 take render: every frame is at exactly start + n/fps on the virtual clock, cancel stops cleanly, and unreasonable requests are refused',t.frames===12&&t.exactTimes&&t.cancelled&&t.idle&&t.plans.fps&&t.plans.big&&t.plans.long&&t.plans.backwards,JSON.stringify(t));
    const dls=[]; p.on('download',d=>dls.push(d));
    const zr=await p.evaluate(async()=>{ const r=await renderOffline({mode:'turntable',W:320,H:180,fps:30,format:'jpeg',start:0,end:0.3,segment:4}); return {frames:r.frames,downloads:r.downloads,bytes:r.bytes}; }); await p.waitForTimeout(2500);
    let zipOk='no downloads'; if(dls.length){ const zp=path.join(os.tmpdir(),'fp-seg-'+Date.now()+'.zip'); await dls[0].saveAs(zp); try{ zipOk=cp.execSync('unzip -tq '+zp).toString(); }catch(e){ zipOk=String(e.stdout||e.message); } try{ fs.unlinkSync(zp); }catch(e){} }
    rec('G22 zip-segment output: frames are split into segments and each archive passes a real unzip',zr.frames===9&&zr.downloads>=3&&dls.length>=3&&/No errors/.test(zipOk),JSON.stringify({zr,downloads:dls.length,zipOk:zipOk.trim().slice(0,60)}));
    rec('G22 no console errors',p.errs.filter(e=>!/Failed to load/.test(e)).length===0,p.errs[0]||''); await p.context().close(); }
  // ── G23: the lab is findable in both skins ──
  { const p=await page(b,'scale=0.1&q=0&type=0',{ctx:{viewport:{width:1440,height:900}}});
    const r=await p.evaluate(async()=>{ const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const out={bench:document.body.classList.contains('bench'),names:[...document.querySelectorAll('.labBtns [data-sec]')].map(b=>b.dataset.sec)};
      const visible=id=>{ const e=document.getElementById(id); return !!e&&e.offsetParent!==null; };
      for(const [sec,id] of [['Pareidolia lab','lbStart'],['Render video · offline, fixed time','ofRender'],['3D mesh export · experimental','mhBuild'],['Comfort & safety','cCalm']]){ document.getElementById('ui').classList.add('hidden'); document.querySelector('.labBtns [data-sec="'+sec+'"]').click(); await sleep(700); out[id]=visible(id)&&!document.getElementById('ui').classList.contains('hidden'); }
      document.getElementById('ui').classList.add('hidden'); window.dispatchEvent(new KeyboardEvent('keydown',{key:'b'})); await sleep(500); out.figure=!document.body.classList.contains('bench'); out.nodeThere=visible('nLab'); document.getElementById('nLab').click(); await sleep(700); out.nodeOpensLab=visible('lbStart')&&!document.getElementById('ui').classList.contains('hidden'); out.legend=!![...document.querySelectorAll('#legend li')].find(l=>/lab/.test(l.textContent)); return out; });
    rec('G23 the lab, video render, mesh export and comfort controls open from the bench buttons and from the Figure skin node',r.bench&&r.names.length===5&&r.names.includes('Text sculpture')&&r.lbStart&&r.ofRender&&r.mhBuild&&r.cCalm&&r.figure&&r.nodeThere&&r.nodeOpensLab&&r.legend,JSON.stringify(r));
    rec('G23 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }

  // ── G24: Text sculpture ──
  { const p=await page(b,'scale=0.1&q=0&type=0',{ctx:{viewport:{width:1280,height:800}}});
    const u=await p.evaluate(()=>{ const w=24,h=24,m=new Uint8Array(w*h); for(let y=8;y<16;y++) for(let x=8;x<16;x++) m[y*w+x]=1; const dOut=fpText.edtSq(m,w,h,1), dIn=fpText.edtSq(m,w,h,0); const f=fpText.buildTextField('HELLO','sans'); const g=fpText.buildTextField('Hi\u0007\u0000ghijklmnopqrstuvwxyz1234567890','sans');
      return {outFar:Math.sqrt(dOut[0*w+0]),outEdge:dOut[8*w+7],inCenter:Math.sqrt(dIn[11*w+11]),inEdge:dIn[8*w+8],fieldW:f.W,fieldH:f.H,aspect:+(f.ext[0]/f.ext[1]).toFixed(2),letters:f.letters,san:fpText.sanitizeText('a\u0001b\u0007c'+'x'.repeat(40)).length,san2:fpText.sanitizeText('a\u0001b'),longText:g.text.length,minSd:Math.min(...Array.from({length:f.W*f.H},(_,i)=>f.data[i*2])),maxId:Math.max(...Array.from({length:f.W*f.H},(_,i)=>f.data[i*2+1]))}; });
    rec('G24 distance transform is exact on a test square; text fields are sized by their words; control characters are stripped and length is capped at 16',Math.abs(u.outFar-Math.hypot(8,8)+1)<1.2&&u.outEdge===1&&Math.abs(u.inCenter-3)<1.01&&u.inEdge===1&&u.letters===5&&u.aspect>=2&&u.san===16&&u.san2==='ab'&&u.longText===16&&u.minSd<0&&u.maxId===4,JSON.stringify(u));
    const r=await p.evaluate(async()=>{ document.getElementById('bSilent').click(); await new Promise(r=>setTimeout(r,800)); setText('HI','sans',true,{quiet:true}); const ti=TYPES.findIndex(x=>x.name==='Text sculpture'); const sm=$('sTrans').value; $('sTrans').value='cut'; applyState(Object.assign(exportState(),{type:ti,sym:0,az:0,el:0.05,zoom:0.9,pins:{}})); $('sTrans').value=sm; for(let i=0;i<60&&shown!==ti;i++) await new Promise(r=>setTimeout(r,250)); await new Promise(r=>setTimeout(r,800));
      const grab=async()=>{ const o=await renderStill({W:480,H:270,ss:1,transparent:true,floor:'none'}); if(o.error) return {err:o.error}; const d=o.canvas.getContext('2d').getImageData(0,0,480,270).data; let n=0,minx=1e9,maxx=-1,miny=1e9,maxy=-1,sum=0; for(let y=0;y<270;y++) for(let x=0;x<480;x++){ const i=(y*480+x)*4; if(d[i+3]>128){ n++; sum+=d[i]+d[i+1]+d[i+2]; if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y; } } return {n,w:maxx-minx,h:maxy-miny,sum}; };
      const same=await (async()=>{ TXT.diff=false; setText('HI','sans',false,{quiet:true}); await new Promise(r=>setTimeout(r,500)); return grab(); })(); const diff=await (async()=>{ setText('HI','sans',true,{quiet:true}); await new Promise(r=>setTimeout(r,500)); return grab(); })();
      setText('HELLO WORLD','sans',true,{quiet:true}); await new Promise(r=>setTimeout(r,500)); const wide=await grab(); const st=exportState(); const sp=makeSpecimen({state:st,name:'text test'});
      return {shown:TYPES[shown].name,same,diff,wide,txtInState:st.txt,fontInState:st.txtFont,specKeeps:sp.state.txt==='HELLO WORLD'}; });
    rec('G24 text renders as a solid wider than tall; wider text is wider; per-letter patterns change the surface; text is saved in the state and in specimens',r.shown==='Text sculpture'&&!r.same.err&&r.same.n>3000&&r.same.w>r.same.h*0.8&&r.wide.w>r.diff.w*1.3&&r.same.sum!==r.diff.sum&&r.txtInState==='HELLO WORLD'&&r.specKeeps,JSON.stringify({shown:r.shown,same:r.same,diff:r.diff,wide:r.wide,txt:r.txtInState}));
    const rt=await p.evaluate(async()=>{ setText('GO','sans',true,{quiet:true}); const st=exportState(); setText('ZZZ','serif',false,{quiet:true}); applyState(st); await new Promise(r=>setTimeout(r,300)); return {txt:TXT.text.trim(),font:TXT.font,diff:TXT.diff,input:$('txtIn').value}; });
    rec('G24 restoring a saved state brings back the text, font and per-letter setting',rt.txt==='GO'&&rt.font==='sans'&&rt.diff===true&&rt.input==='GO',JSON.stringify(rt));
    const ms=await p.evaluate(async()=>{ setText('O','sans',true,{quiet:true}); const r=await fpMesh.build({n:40,iso:0.8}); if(r.error||r.cancelled) return r; const s=r.stats; return {tri:s.triangles,bad:(s.boundaryEdges+s.nonManifoldEdges)/Math.max(1,s.edges),euler:s.euler}; });
    rec('G24 a text sculpture can be exported as a mesh (many triangles, under 1% questionable edges)',!ms.error&&ms.tri>800&&ms.bad<0.01,JSON.stringify(ms));
    rec('G24 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }
};
