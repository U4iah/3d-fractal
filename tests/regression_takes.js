// Takes, video files and the stale-page banner (G25). Runnable alone: FP_ONLY=1 node tests/regression.js
module.exports=async function({b,page,rec,errText,URL}){
  const fs=require('fs'), cp=require('child_process'), os=require('os'), path=require('path');
  const probe=(f)=>{ try{ return JSON.parse(cp.execSync('ffprobe -v error -show_entries stream=sample_rate,codec_type,codec_name,pix_fmt,width,height,avg_frame_rate,nb_frames,duration -of json '+f).toString()).streams; }catch(e){ return []; } };
  const decodeOK=(f)=>{ try{ return cp.execSync('ffmpeg -v error -i '+f+' -f null - 2>&1').toString().trim()===''; }catch(e){ return false; } };
  const synth=`(()=>{ const frames=[]; let tt=0; for(let i=0;i<70;i++){ tt+=0.03+0.04*((i*7)%5)/4; const f=new Array(28).fill(0); f[0]=+tt.toFixed(3); f[1]=0.3+tt*0.2; f[2]=0.2; f[3]=1; f[16]=0.4+0.3*Math.sin(tt*3); f[17]=0.3; f[18]=0.3; f[26]=0.3; frames.push(f); } return {frames,tt}; })()`;
  // ── G25: takes are kept, a card appears, one click makes a video of the whole take ──
  { const p=await page(b,'scale=0.1&q=0&type=0',{ctx:{viewport:{width:1280,height:800},acceptDownloads:true}});
    const r=await p.evaluate(async()=>{ for(const x of await takeDB.all()) await takeDB.del(x.id); FractalPulse.startTake(); for(let i=0;i<400&&!(takeRec&&takeRec.frames.length>=4);i++) await new Promise(r=>setTimeout(r,50)); FractalPulse.stopTake(); for(let i=0;i<60&&!document.querySelector('#tkSel option[value^="tk"]');i++) await new Promise(r=>setTimeout(r,100));
      const card=document.getElementById('takeCard'); const all=await takeDB.all(); return {cardShown:card.classList.contains('show'),title:document.getElementById('tcTitle').textContent,hasVideoBtn:!!document.getElementById('tcVideo'),dur:take.duration,stored:all.length,storedDur:all[0]&&all[0].duration,len:document.getElementById('tkLen').textContent,listed:[...document.querySelectorAll('#tkSel option')].map(o=>o.textContent)}; });
    rec('G25 stopping a recording shows a card with the take length and a video button, saves the take, and lists it as the latest',r.cardShown&&/Take saved/.test(r.title)&&r.hasVideoBtn&&r.stored===1&&Math.abs(r.storedDur-r.dur)<1e-6&&/long/.test(r.len)&&/Latest/.test(r.listed[0]||''),JSON.stringify(r));
    await p.reload({waitUntil:'commit'}); await p.waitForFunction(()=>typeof frame!=='undefined'&&frame>2,null,{timeout:240000}); await p.evaluate(()=>document.getElementById('bSilent').click()); await p.waitForTimeout(1200);
    const r2=await p.evaluate(async()=>{ for(let i=0;i<60&&!document.querySelector('#tkSel option[value]:not([value=""])');i++) await new Promise(r=>setTimeout(r,100)); const opts=[...document.querySelectorAll('#tkSel option')].filter(o=>o.value); const had=opts.length; take=null; takeChanged(false); const sel=document.getElementById('tkSel'); sel.value=opts[0].value; sel.dispatchEvent(new Event('change')); for(let i=0;i<80&&!take;i++) await new Promise(r=>setTimeout(r,100)); return {had,loaded:!!take,dur:take&&take.duration,len:document.getElementById('tkLen').textContent}; });
    rec('G25 after a reload the take is still there, can be picked from the list, and the whole length is shown without asking for seconds',r2.had>=1&&r2.loaded&&r2.dur>0&&r2.len.includes('long')&&!/^No take/.test(r2.len),JSON.stringify(r2));
    const vid=await p.evaluate(`(async()=>{ const sy=${synth}; take={format:'fractal-pulse-performance',v:1,created:new Date().toISOString(),duration:sy.tt,song:null,start:exportState(),cols:TAKE_COLS,frames:sy.frames,events:[],observations:[],id:'tk-test',name:'Test take'}; takeChanged(true);
      const o=document.createElement('option'); o.value='320x180@30'; o.textContent='tiny'; document.getElementById('vqSel').appendChild(o); document.getElementById('vqSel').value='320x180@30'; document.getElementById('vAudio').checked=false; const t0=performance.now(); document.getElementById('ofVideo').click(); await new Promise(r=>setTimeout(r,600)); const bar=document.getElementById('rbar').classList.contains('show');
      for(let i=0;i<600&&/Making the video|Preparing/.test(document.getElementById('ofInfo').textContent);i++) await new Promise(r=>setTimeout(r,500)); await new Promise(r=>setTimeout(r,800)); return {bar,barAfter:document.getElementById('rbar').classList.contains('show'),info:document.getElementById('ofInfo').textContent.slice(0,140),dur:take.duration}; })()`);
    rec('G25 "Make video of the whole take" shows progress and finishes with a saved-video message',vid.bar&&!vid.barAfter&&/Video saved/.test(vid.info),JSON.stringify(vid));
    rec('G25 no console errors',p.errs.filter(e=>!/Failed to load|Fetch API cannot load/.test(e)).length===0,JSON.stringify(p.errs)); await p.context().close(); }
  // the file itself, checked by real ffprobe/ffmpeg
  { const p=await page(b,'scale=0.1&q=0&type=0',{ctx:{viewport:{width:1280,height:800},acceptDownloads:true}}); const dls=[]; p.on('download',d=>dls.push(d));
    const v=await p.evaluate(`(async()=>{ const sy=${synth}; take={format:'fractal-pulse-performance',v:1,created:new Date().toISOString(),duration:sy.tt,song:null,start:exportState(),cols:TAKE_COLS,frames:sy.frames,events:[],observations:[]};
      const res=await renderVideo({mode:'take',W:320,H:180,fps:30,start:0,end:take.duration,audio:false}); if(!res.ok) return res; saveBlobFile(res.blob,'t.mp4'); return {ok:true,frames:res.frames,seconds:res.seconds,dur:take.duration,codec:res.codec}; })()`); await p.waitForTimeout(1500);
    let st=[]; let ok=false; if(dls.length){ const f=path.join(os.tmpdir(),'fp-v-'+Date.now()+'.mp4'); await dls[0].saveAs(f); st=probe(f); ok=decodeOK(f); try{ fs.unlinkSync(f); }catch(e){} }
    const vs=st.find(s=>s.codec_type==='video')||{};
    rec('G25 the MP4 is a real H.264 file: right size, 30 fps, yuv420p, frame count matches, duration matches, and it decodes cleanly',v.ok&&vs.codec_name==='h264'&&vs.width===320&&vs.height===180&&vs.pix_fmt==='yuv420p'&&vs.avg_frame_rate==='30/1'&&+vs.nb_frames===v.frames&&Math.abs(+vs.duration-v.frames/30)<0.05&&Math.abs(v.seconds-v.dur)<=1/30+1e-6&&ok,JSON.stringify({v,vs,decodeOK:ok}));
    await p.context().close(); }
  // song included when the same song is loaded
  { const p=await page(b,'scale=0.1&q=0&type=0',{ctx:{viewport:{width:1280,height:800},acceptDownloads:true}}); const dls=[]; p.on('download',d=>dls.push(d));
    const sr=22050,n=sr*5,buf=Buffer.alloc(44+n*2); buf.write('RIFF',0); buf.writeUInt32LE(36+n*2,4); buf.write('WAVEfmt ',8); buf.writeUInt32LE(16,16); buf.writeUInt16LE(1,20); buf.writeUInt16LE(1,22); buf.writeUInt32LE(sr,24); buf.writeUInt32LE(sr*2,28); buf.writeUInt16LE(2,32); buf.writeUInt16LE(16,34); buf.write('data',36); buf.writeUInt32LE(n*2,40); for(let i=0;i<n;i++){ const t=i/sr; buf.writeInt16LE(Math.round(Math.sin(2*Math.PI*440*t)*12000),44+i*2); }
    await p.setInputFiles('#fFile',{name:'my beat.wav',mimeType:'audio/wav',buffer:buf}); await p.waitForFunction(()=>isFinite(player.duration)&&player.currentTime>0.1,null,{timeout:90000});
    const a=await p.evaluate(`(async()=>{ const sy=${synth}; take={format:'fractal-pulse-performance',v:1,created:new Date().toISOString(),duration:sy.tt,song:{name:'my beat.wav',duration:5,songOffset:1},start:exportState(),cols:TAKE_COLS,frames:sy.frames,events:[],observations:[]};
      const res=await renderVideo({mode:'take',W:320,H:180,fps:30,start:0,end:Math.min(2,take.duration),audio:true}); if(!res.ok) return res; saveBlobFile(res.blob,'a.mp4');
      take.song.name='some other song.mp3'; const res2=await renderVideo({mode:'take',W:320,H:180,fps:30,start:0,end:0.5,audio:true}); return {ok:true,audio:res.audio,kind:res.audioKind,notes:res.notes,mismatchAudio:res2.audio,mismatchNote:(res2.notes||[]).join(' ')}; })()`); await p.waitForTimeout(1500);
    let st=[]; let ok=false; if(dls.length){ const f=path.join(os.tmpdir(),'fp-a-'+Date.now()+'.mp4'); await dls[0].saveAs(f); st=probe(f); ok=decodeOK(f); try{ fs.unlinkSync(f); }catch(e){} }
    const vs=st.find(s=>s.codec_type==='video')||{}, as=st.find(s=>s.codec_type==='audio')||{};
    rec('G25 with the same song loaded the video carries its audio track (matching length, decodes cleanly); with a different song loaded it says so instead',a.ok&&a.audio&&['opus','aac'].includes(as.codec_name)&&Math.abs(+as.duration-+vs.duration)<0.15&&+as.sample_rate>=44100&&ok&&a.mismatchAudio===false&&/Load|loaded/.test(a.mismatchNote),JSON.stringify({a,as,vs:{d:vs.duration},decodeOK:ok}));
    await p.context().close(); }
  // robustness: the stale-page banner, GPU loss during an export, byte-budgeted zip segments
  { const p=await page(b,'scale=0.1&q=0&type=0',{ctx:{viewport:{width:1280,height:800},acceptDownloads:true}}); const dls=[]; p.on('download',d=>dls.push(d));
    const u=await p.evaluate(async()=>{ window.fpTestUpdate=true; const real=window.fetch; const bar=()=>document.getElementById('updBar').classList.contains('show'); const out={start:bar()};
      window.fetch=async()=>({ok:true,text:async()=>"const APP_VERSION='"+APP_VERSION+"';"}); await checkUpdate(); out.same=bar();
      window.fetch=async()=>({ok:true,text:async()=>"const APP_VERSION='fp-9999.01.01-future';"}); await checkUpdate(); out.newer=bar(); window.fetch=async()=>{ throw new Error('offline'); }; document.getElementById('updBar').classList.remove('show'); await checkUpdate(); out.offline=bar(); window.fetch=real; return out; });
    rec('G25 a stale copy is detected: no banner when current or offline, banner when a newer version exists',!u.start&&!u.same&&u.newer&&!u.offline,JSON.stringify(u));
    const g=await p.evaluate(async()=>{ const pr=renderOffline({mode:'turntable',W:320,H:180,fps:30,format:'jpeg',start:0,end:3,sink:'none'}); setTimeout(()=>{ canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})); },1500); const r=await pr; return {cancelled:!!r.cancelled,activeAfter:off.active,msg:document.getElementById('err').textContent}; });
    rec('G25 if the graphics card gives out during an export, the export stops cleanly with a plain message and does not reload the page',g.cancelled&&!g.activeAfter&&/ran out of memory/.test(g.msg),JSON.stringify(g));
    const z=await p.evaluate(async()=>{ const r=await renderOffline({mode:'turntable',W:320,H:180,fps:30,format:'jpeg',start:0,end:0.4,segment:1000,segmentBytes:30000}); return {frames:r.frames,downloads:r.downloads,bytes:r.bytes}; }); await p.waitForTimeout(1500);
    rec('G25 zip segments are split by size, not only by frame count, so memory per archive stays bounded',z.frames===12&&z.downloads>=2&&dls.length>=2,JSON.stringify({z,downloads:dls.length}));
    rec('G25 no console errors',p.errs.filter(e=>!/Failed to load|offline|Fetch API cannot load|ran out of memory/.test(e)).length===0,JSON.stringify(p.errs)); await p.context().close(); }
  // G26: play/pause thrash on the player (seen on an iPhone) is detected and stopped instead of burning CPU
  { const p=await page(b,'scale=0.1&q=0&type=0');
    const g=await p.evaluate(async()=>{ const pl=document.getElementById('player'); let flips=0; pl.addEventListener('pause',()=>flips++); for(let i=0;i<30;i++){ pl.dispatchEvent(new Event('play')); pl.dispatchEvent(new Event('pause')); await new Promise(r=>setTimeout(r,20)); }
      const err=/kept stopping/.test(document.getElementById('err').textContent); const tripped=audioLoop.tripped; pl.dispatchEvent(new Event('playing')); return {err,tripped,reset:!audioLoop.tripped}; });
    rec('G26 a play/pause loop on the player trips a guard with a plain message, and a normal play re-arms it',g.err&&g.tripped&&g.reset,JSON.stringify(g));
    const r=await p.evaluate(async()=>{ let n=0; const real=actx.resume.bind(actx); actx.resume=()=>{ n++; return real(); }; for(let i=0;i<40;i++){ resumeSoon(); } return {resumeCalls:n}; });
    rec('G26 audio-context resume requests are rate limited (at most one per second)',r.resumeCalls<=1,JSON.stringify(r)); await p.context().close(); }
  // G27: phones start with the two newest always-on extras off (suspected cause of a hot, laggy phone); desktops are unchanged
  { const m=await page(b,'scale=0.1&q=0&type=0',{ctx:{viewport:{width:390,height:800},hasTouch:true,isMobile:true,acceptDownloads:true}});
    const a=await m.evaluate(()=>({guard:document.getElementById('cSafeGuard').checked,sync:+document.getElementById('sSync').value,flag:localStorage.getItem('fpPhoneSafe1'),direct:outNode()===actx.destination,coarse:matchMedia('(pointer:coarse)').matches}));
    rec('G27 on a phone the flash-guard readback and the audio sync delay start off, and sound goes straight to the speakers',a.coarse&&!a.guard&&a.sync===0&&a.flag==='1'&&a.direct,JSON.stringify(a));
    await m.evaluate(()=>{ const g=document.getElementById('cSafeGuard'); g.checked=true; g.dispatchEvent(new Event('change')); save(); }); await m.reload({waitUntil:'commit'}); await m.waitForFunction(()=>typeof frame!=='undefined'&&frame>2,null,{timeout:240000});
    const a2=await m.evaluate(()=>document.getElementById('cSafeGuard').checked);
    rec('G27 turning the guard back on is remembered (the phone default is applied only once)',a2===true,String(a2)); await m.context().close();
    const d=await page(b,'scale=0.1&q=0&type=0'); const c=await d.evaluate(()=>({guard:document.getElementById('cSafeGuard').checked,sync:+document.getElementById('sSync').value}));
    rec('G27 on a desktop the guard stays on and sync stays at its default',c.guard&&c.sync===40,JSON.stringify(c)); await d.context().close(); }
  // G28: the big scene shader compiles without freezing the page, and anything that needs it early just waits
  { const p=await page(b,'scale=0.1&q=0&type=0');
    const g=await p.evaluate(()=>({ready:progScene.ready,ms:progScene.ms,par:!!parExt,note:!!document.getElementById('bootNote'),diag:fpDiag.state().sceneCompileMs}));
    rec('G28 the scene shader is ready, the "preparing" note is gone, and the compile time is recorded in diagnostics',g.ready&&g.ms>=0&&!g.note&&g.diag===g.ms,JSON.stringify(g));
    const w=await p.evaluate(()=>{ const p2=makeProg('fs','early-scene',null,true); const early=p2.ready; p2.set({uSteps:5}); return {early,after:p2.ready,ok:Object.keys(p2.u).length>20}; });
    rec('G28 using a program before its compile finished waits for it instead of failing',w.after&&w.ok,JSON.stringify(w)); await p.context().close(); }
};
