(() => {
 let dispose=()=>{};
 function mount(){
  dispose();
  const hero=document.querySelector('.hero');if(!hero)return;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  canvas.className='hero-mosaic';canvas.setAttribute('aria-hidden','true');hero.prepend(canvas);hero.classList.add('has-mosaic');
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController();
  let width=0,height=0,cols=0,rows=0,cells=[],frame=0,last=0,visible=true,destroyed=false,energy=0,bass=0,mids=0,treble=0,phase=0,previousBass=0,previousTreble=0,bassFloor=0,lastKick=-1000,lastSpark=-1000,sequence=0;
  const trail=[],pulses=[],sparks=[],bands=new Float32Array(28);
  let idleGlow=null,nextGlow=performance.now()+4000+Math.random()*3000;
  const noise=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
  const clamp=value=>Math.max(0,Math.min(1,value));
  // Fixed saturated hues preserve each frequency's identity without muddy RGB blends.
  const vivid=(hue,lightness)=>`hsl(${hue} 100% ${lightness}%)`;
  function fit(){
   const box=hero.getBoundingClientRect();width=box.width;height=box.height;
   const preferred=width<600?34:64;
   cols=Math.max(1,Math.round(width/preferred));rows=Math.max(1,Math.round(height/preferred));
   // Whole cells cover the header, without text-shaped exclusion rectangles.
   const cellWidth=width/cols,cellHeight=height/rows;
   cells=[];
   for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){
    const x=Math.round(gx*cellWidth),y=Math.round(gy*cellHeight),w=Math.round((gx+1)*cellWidth)-x,h=Math.round((gy+1)*cellHeight)-y;
    cells.push({x,y,w,h,gx,gy,n:noise(gx,gy)});
   }
   const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
   canvas.dataset.columns=String(cols);canvas.dataset.rows=String(rows);
   draw(performance.now(),0);start();
  }
  function draw(now,elapsed){
   ctx.clearRect(0,0,width,height);
   const reduced=motion.matches,spectrum=!reduced&&window.readMusicSpectrum?.();
   let sum=0,low=0,middle=0,high=0,rawBass=0,rawTreble=0;
   for(let i=0;i<28;i++){
    const value=spectrum?.[i]||0;bands[i]+=(value-bands[i])*.3;sum+=bands[i]*bands[i];
    if(i<9){low+=bands[i];rawBass+=value;}else if(i<21)middle+=bands[i];else{high+=bands[i];rawTreble+=value;}
   }
   energy=clamp(Math.sqrt(sum/28)*1.5);bass=low/9;mids=middle/12;treble=high/7;rawBass/=9;rawTreble/=7;
   const media=document.querySelector('#listening-room audio'),playing=Boolean(media&&!media.paused&&!media.ended)||energy>.015;
   if(reduced||playing){idleGlow=null;nextGlow=now+4500;}
   else{
    if(idleGlow&&now-idleGlow.time>1800)idleGlow=null;
    if(!idleGlow&&now>=nextGlow){idleGlow={time:now,gx:Math.floor(Math.random()*cols),gy:Math.floor(Math.random()*rows),hue:[52,28,83,280][Math.floor(Math.random()*4)]};nextGlow=now+4500+Math.random()*4000;}
   }
   bassFloor+=(rawBass-bassFloor)*.035;
   // Detect low-frequency onsets rather than claiming to identify individual drum stems.
   if(!reduced&&rawBass>.18&&rawBass-previousBass>.035&&rawBass>bassFloor*1.05&&now-lastKick>220){
    sequence++;pulses.push({time:now,strength:rawBass,cx:cols*(.64+noise(sequence,2)*.25),cy:rows*(.28+noise(sequence,4)*.45)});lastKick=now;if(pulses.length>4)pulses.shift();
   }
   if(!reduced&&rawTreble>.13&&((rawTreble-previousTreble>.025)||(rawTreble>.3&&now-lastSpark>270))&&now-lastSpark>120){
    sequence++;sparks.push({time:now,strength:rawTreble,gx:Math.floor(noise(sequence,7)*cols),gy:Math.floor(noise(sequence,9)*rows)});lastSpark=now;if(sparks.length>7)sparks.shift();
   }
   previousBass=rawBass;previousTreble=rawTreble;
   while(pulses.length&&now-pulses[0].time>1400)pulses.shift();
   while(sparks.length&&now-sparks[0].time>600)sparks.shift();
   while(trail.length&&now-trail[0].time>1100)trail.shift();
   if(!reduced)phase+=elapsed*(.00002+mids*.00024+(trail.length?.00008:0));
   for(const cell of cells){
    const {x,y,w,h,gx,gy,n}=cell,nx=(gx+.5)/cols,ny=(gy+.5)/rows;
    const wave=(Math.sin(nx*9+ny*5-phase)+Math.cos(nx*4-ny*7+phase*.7)+2)/4;
    let color=vivid(266,30+wave*28),alpha=.72+wave*.18;
    // Midrange bends a connected ribbon into islands and curved pixel contours.
    const contour=Math.abs(Math.sin(nx*9+ny*4+Math.sin(ny*6-phase)*1.6-phase));
    const midShape=clamp(1-contour/(.13+mids*.38))*mids;
    if(midShape>.08){color=vivid(28,32+clamp(mids*1.8)*25);alpha=.96;}
    // Account for cell proportions so bass onsets produce circular pixel rings.
    let ring=0;
    for(const pulse of pulses){const age=(now-pulse.time)/1400,distance=Math.hypot(gx-pulse.cx,(gy-pulse.cy)*(height/rows)/(width/cols)),radius=age*Math.max(cols,rows)*.65;ring=Math.max(ring,clamp(1-Math.abs(distance-radius)/1.4)*(1-age)*pulse.strength);}
    if(ring>.035){const strength=clamp(ring*2.8);color=strength<.65?vivid(266,28+strength*48):vivid(52,50+(strength-.65)*22);alpha=.98;}
    // High frequencies form short lime crosses and single-cell sparks.
    let sparkle=0;
    for(const spark of sparks){const distance=Math.abs(gx-spark.gx)+Math.abs(gy-spark.gy);if(distance<=1)sparkle=Math.max(sparkle,(1-(now-spark.time)/600)*spark.strength*(distance===0?1:.55));}
    if(sparkle>.045){color=vivid(83,24+clamp(sparkle*3)*34);alpha=.98;}
    let proximity=0;
    if(!reduced)for(const point of trail){if(point.x>=x&&point.x<x+w&&point.y>=y&&point.y<y+h)proximity=Math.max(proximity,1-(now-point.time)/1100);}
    if(proximity>.22){color=vivid(52,42+proximity*14);alpha=Math.max(alpha,proximity);}
    // Continuous shading, never rectangular masks around lines of type.
    ctx.fillStyle=color;ctx.globalAlpha=alpha;ctx.fillRect(x,y,w,h);
    ctx.strokeStyle='#7028dd';ctx.lineWidth=1;ctx.globalAlpha*=.3;ctx.strokeRect(x+.5,y+.5,w-1,h-1);
    if(idleGlow&&gx===idleGlow.gx&&gy===idleGlow.gy){const glow=Math.sin(Math.PI*clamp((now-idleGlow.time)/1800));ctx.fillStyle=vivid(idleGlow.hue,57);ctx.globalAlpha=glow*.9;ctx.fillRect(x,y,w,h);}
   }
   ctx.globalAlpha=1;
   canvas.dataset.energy=energy.toFixed(3);canvas.dataset.bass=bass.toFixed(3);canvas.dataset.mids=mids.toFixed(3);canvas.dataset.treble=treble.toFixed(3);canvas.dataset.pulses=String(pulses.length);canvas.dataset.sparks=String(sparks.length);canvas.dataset.pointer=String(!reduced&&trail.length>0);canvas.dataset.motion=reduced?'reduced':'active';canvas.dataset.idleGlow=String(Boolean(idleGlow));
  }
  function tick(now){frame=0;if(destroyed||!visible||document.hidden||motion.matches)return;const elapsed=now-last;if(elapsed>32){draw(now,Math.min(elapsed,80));last=now;}frame=requestAnimationFrame(tick);}
  function start(){if(!frame&&!destroyed&&visible&&!document.hidden&&!motion.matches){last=performance.now();frame=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(frame);frame=0;}
  const observer=new ResizeObserver(fit);observer.observe(hero);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();});intersection.observe(hero);
  hero.addEventListener('pointermove',event=>{if(motion.matches||event.pointerType==='touch')return;const r=hero.getBoundingClientRect(),x=event.clientX-r.left,y=event.clientY-r.top,previous=trail[trail.length-1];if(!previous||Math.hypot(previous.x-x,previous.y-y)>12){trail.push({x,y,time:performance.now()});if(trail.length>24)trail.shift();}start();},{passive:true,signal:events.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();},{signal:events.signal});
  motion.addEventListener('change',()=>{stop();trail.length=0;pulses.length=0;sparks.length=0;bands.fill(0);energy=0;bass=0;mids=0;treble=0;previousBass=0;previousTreble=0;bassFloor=0;draw(performance.now(),0);start();},{signal:events.signal});
  document.fonts?.ready.then(()=>{if(!destroyed)fit();});fit();
  dispose=()=>{destroyed=true;stop();observer.disconnect();intersection.disconnect();events.abort();canvas.remove();hero.classList.remove('has-mosaic');};
 }
 window.addEventListener('pagenavigate',mount);mount();
})();
