(() => {
 let dispose=()=>{};
 function mount(){
  dispose();const hero=document.querySelector('.hero');if(!hero)return;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  canvas.className='hero-mosaic';canvas.setAttribute('aria-hidden','true');hero.prepend(canvas);hero.classList.add('has-mosaic');
  const logo=new Path2D('M362.05,99.89h-29.97c-5.53,0-10.02-4.48-10.02-10.02v-29.86c0-5.53-4.48-10.02-10.02-10.02h-79.97c-5.53,0-10.02-4.48-10.02-10.02V10.02c0-5.53-4.48-10.02-10.02-10.02h-52c-5.53,0-10.02,4.48-10.02,10.02v51.86c0,5.53,4.48,10.02,10.02,10.02h29.97c5.53,0,10.02,4.48,10.02,10.02v8.07c0,5.53-4.48,10.02-10.02,10.02h-29.97c-5.53,0-10.02,4.48-10.02,10.02v29.97c0,5.53-4.48,10.02-10.02,10.02h-57.97c-5.53,0-10.02-4.48-10.02-10.02v-8.07c0-5.53,4.48-10.02,10.02-10.02h30c5.53,0,10.02-4.48,10.02-10.02v-51.86c0-5.53-4.48-10.02-10.02-10.02h-52c-5.53,0-10.02,4.48-10.02,10.02v29.86c0,5.53-4.48,10.02-10.02,10.02H10.02c-5.53,0-10.02,4.48-10.02,10.02v51.86c0,5.53,4.48,10.02,10.02,10.02h30c5.53,0,10.02,4.48,10.02,10.02v30.07c0,5.53,4.48,10.02,10.02,10.02h102.03c5.53,0,10.02-4.48,10.02-10.02v-29.97c0-5.53,4.48-10.02,10.02-10.02h29.94c5.53,0,10.02-4.48,10.02-10.02v-29.97c0-5.53,4.48-10.02,10.02-10.02h57.94c5.53,0,10.02,4.48,10.02,10.02v8.07c0,5.53-4.48,10.02-10.02,10.02h-29.94c-5.53,0-10.02,4.48-10.02,10.02v51.86c0,5.53,4.48,10.02,10.02,10.02h52c5.53,0,10.02-4.48,10.02-10.02v-30.07c0-5.53,4.48-10.02,10.02-10.02h29.94c5.53,0,10.02-4.48,10.02-10.02v-51.86c0-5.53-4.48-10.02-10.02-10.02Z'),colors=['#3b8457','#3d52df','#f7bb2e','#fd5439','#3b8457','#f7bb2e','#6430c7','#fd5439'];
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController(),bands=new Float32Array(28);
  let width=0,height=0,frame=0,last=0,clock=0,visible=true,destroyed=false,bass=0,mids=0,treble=0,beat=0,previousBass=0,lastBeat=0,sequence=0;
  let pointer={x:.5,y:.5,strength:0,time:0};const clamp=n=>Math.max(0,Math.min(1,n));
  function fit(){
   const box=canvas.getBoundingClientRect();width=box.width;height=box.height;
   const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);draw(performance.now(),0);start();
  }
  function draw(now,elapsed){
   if(!width||!height)return;
   const reduced=motion.matches,spectrum=reduced?null:window.readMusicSpectrum?.();let low=0,mid=0,high=0,energy=0;
   for(let i=0;i<28;i++){const value=spectrum?.[i]||0;bands[i]+=(value-bands[i])*(value>bands[i]?.5:.16);energy+=bands[i]*bands[i];if(i<9)low+=bands[i];else if(i<21)mid+=bands[i];else high+=bands[i];}
   bass=low/9;mids=mid/12;treble=high/7;energy=Math.sqrt(energy/28);
   if(!reduced&&bass>.2&&bass-previousBass>.025&&now-lastBeat>240){beat=1;sequence++;lastBeat=now;}previousBass=bass;beat*=Math.exp(-elapsed/240);
   const active=energy>.015;if(!reduced)clock+=elapsed*(active?.0002+energy*.00065:.000045);
   pointer.strength=reduced?0:clamp(1-(now-pointer.time)/1100);
   ctx.clearRect(0,0,width,height);ctx.save();
   // Clip to the exact supplied logo vector; every animated mark stays inside it.
   ctx.scale(width/372.06,height/221.89);ctx.clip(logo);ctx.scale(372.06/width,221.89/height);
   ctx.fillStyle='#211044';ctx.fillRect(0,0,width,height);
   const rowCount=12,rowHeight=height/rowCount,gap=Math.max(1.5,width*.003);
   for(let row=0;row<rowCount;row++){
    const y=row*rowHeight,ny=(row+.5)/rowCount;
    const bend=pointer.strength*Math.exp(-Math.pow((ny-pointer.y)*4,2))*(pointer.x-.5)*.45;
    const offset=Math.sin(clock*(.7+row*.023)+row*.63)*(.025+mids*.09)+bend;
    const count=8,weights=[];let total=0;
    for(let col=0;col<count;col++){
     const band=bands[(col*3+row*2)%28],wave=Math.sin(clock*1.8+col*.87+row*.38);
     // Shared motion joins rows; real frequency bands expand and compress their blocks.
     const weight=.4+(wave+1)*.38+band*2.8+(col%3===sequence%3?beat*1.15:0);weights.push(weight);total+=weight;
    }
    let x=-width*.23+offset*width;
    for(let col=0;col<count;col++){
     const w=weights[col]/total*width*1.48;ctx.fillStyle=colors[(col+Math.floor(row/2))%colors.length];ctx.fillRect(x+gap/2,y+gap/2,w-gap,rowHeight-gap);
     // Treble makes narrow bright cuts, not another conventional equalizer.
     if(active&&treble>.2&&(col+row)%3===0){ctx.fillStyle='#f7f7f2';ctx.globalAlpha=clamp((treble-.2)*1.5);ctx.fillRect(x+w*.78,y+gap/2,Math.max(gap,w*.035),rowHeight-gap);ctx.globalAlpha=1;}x+=w;
    }
   }
   ctx.restore();canvas.dataset.energy=energy.toFixed(3);canvas.dataset.bass=bass.toFixed(3);canvas.dataset.mids=mids.toFixed(3);canvas.dataset.treble=treble.toFixed(3);canvas.dataset.beat=beat.toFixed(3);canvas.dataset.mode=reduced?'still':active?'audio':'idle';canvas.dataset.shape='chicken-balls-logo';
  }
  function tick(now){frame=0;if(destroyed||!visible||document.hidden||motion.matches)return;const elapsed=now-last;if(elapsed>=32){draw(now,Math.min(elapsed,80));last=now;}frame=requestAnimationFrame(tick);}
  function start(){if(!frame&&!destroyed&&visible&&!document.hidden&&!motion.matches){last=performance.now();frame=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(frame);frame=0;}
  const observer=new ResizeObserver(fit);observer.observe(canvas);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();});intersection.observe(hero);
  hero.addEventListener('pointermove',e=>{if(motion.matches||e.pointerType==='touch')return;const r=canvas.getBoundingClientRect();pointer={x:clamp((e.clientX-r.left)/r.width),y:clamp((e.clientY-r.top)/r.height),strength:1,time:performance.now()};start();},{passive:true,signal:events.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();},{signal:events.signal});
  motion.addEventListener('change',()=>{stop();bands.fill(0);beat=0;draw(performance.now(),0);start();},{signal:events.signal});fit();
  dispose=()=>{destroyed=true;stop();observer.disconnect();intersection.disconnect();events.abort();canvas.remove();hero.classList.remove('has-mosaic');};
 }
 window.addEventListener('pagenavigate',mount);mount();
})();
