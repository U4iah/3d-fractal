// Phase-specific suites, loaded by regression.js
module.exports=async function({b,page,rec,errText,URL}){
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
    rec('G7 parameter schema covers all 21 formulas',cov.split(',').length===21,cov);
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
    const lin=await p.evaluate(async()=>{ const o=specimens[0]; duplicateSpecimen(o,false); const dup=specimens[0]; duplicateSpecimen(o,true); await new Promise(r=>setTimeout(r,3500)); const vr=specimens[0];
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
    const tk=await p.evaluate(async()=>{ FractalPulse.startTake(); await new Promise(r=>setTimeout(r,2500)); FractalPulse.stopTake(); if(!take) return {err:'no take'}; playStart(); await new Promise(r=>setTimeout(r,1200)); const n0=specimens.length; specimenFromTake(); await new Promise(r=>setTimeout(r,3500)); const sp=specimens[0]; playStop(); return {added:specimens.length-n0,kind:sp.source.kind,t:sp.source.take&&sp.source.take.t,frozen:sp.state.frozen}; });
    rec('G8 capture a specimen from a performance take (source + timestamp recorded, frozen)',tk.added===1&&tk.kind==='take'&&tk.t>0&&tk.frozen===1,JSON.stringify(tk));
    // persistence across reload
    const nBefore=await p.evaluate(()=>specimens.length); await p.reload(); await p.waitForSelector('#bSilent',{timeout:120000});
    const nAfter=await p.evaluate(()=>specimens.length); rec('G8 library persists across reload',nAfter===nBefore&&nAfter>=6,`${nBefore}→${nAfter}`);
    rec('G8 no console errors',p.errs.length===0,p.errs[0]||''); await p.context().close(); }
};
