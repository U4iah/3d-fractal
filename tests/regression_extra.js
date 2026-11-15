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
};
