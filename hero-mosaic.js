(() => {
 let dispose=()=>{};
 function mount(){
  dispose();const hero=document.querySelector('.hero');if(!hero)return;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  canvas.className='hero-mosaic';canvas.setAttribute('aria-hidden','true');hero.prepend(canvas);hero.classList.add('has-mosaic');
  const colors=['#bcff35','#3d52df','#f5a623','#fd5439','#bcff35','#f5a623','#7738eb','#fd5439'];
  hero.dataset.visualizer='A';
  let drawB=null,selected='A';
  const selector=document.createElement('div');selector.className='hero-visualizer-selector';selector.setAttribute('role','group');selector.setAttribute('aria-label','Choose visualizer');
  const label=document.createElement('span');label.textContent='VISUALIZER';selector.append(label);
  const buttons=['A','B'].map(name=>{const button=document.createElement('button');button.type='button';button.textContent=name;button.setAttribute('aria-label','Visualizer '+name);button.setAttribute('aria-pressed',String(name==='A'));if(name==='B'){button.disabled=true;button.title='Loading liquid visualizer';}selector.append(button);return button;});hero.append(selector);
  function choose(name){if(!['A','B'].includes(name)||(name==='B'&&!drawB))return;selected=name;hero.dataset.visualizer=name;pointerTrail.length=0;buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.textContent===name)));try{localStorage.setItem('chicken-balls-visualizer',name);}catch{}fit();}
  buttons.forEach(button=>button.addEventListener('click',()=>choose(button.textContent)));
  import('./visualizer-b.js?v=20261009-morph-bloom-1').then(module=>{if(destroyed)return;drawB=module.drawLiquidGrid;buttons[1].disabled=false;buttons[1].title='Liquid bloom';let preferred;try{preferred=localStorage.getItem('chicken-balls-visualizer');}catch{}choose(new URLSearchParams(location.search).get('visualizer')||preferred||'A');}).catch(()=>{});
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController(),bands=new Float32Array(28);
  let width=0,height=0,frame=0,last=0,clock=0,visible=true,destroyed=false,bass=0,mids=0,treble=0,beat=0,previousBass=0,lastBeat=0,sequence=0,bassFloor=0,previousHigh=0,trebleHit=0,lastHigh=0,focusLeft=0,layoutKey='';
  const pointerTrail=[];
  const streakBands=new Float32Array(28),streakWidths=new Float32Array(96),streakOffsets=new Float32Array(12);
  let streakClock=0,dancePulse=0;
  let pointer={x:.5,y:.5,strength:0,time:0};const clamp=n=>Math.max(0,Math.min(1,n));
  function geometry(){
   const heroBox=hero.getBoundingClientRect(),title=hero.querySelector('#hero-title'),titleBox=title.getBoundingClientRect();
   let textRight=titleBox.left;
   const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT);
   while(walker.nextNode()){if(!walker.currentNode.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(walker.currentNode);textRight=Math.max(textRight,range.getBoundingClientRect().right);}
   const gutter=titleBox.left-heroBox.left;
   return {heroBox,gutter,textRight,key:[heroBox.width,heroBox.height,heroBox.left,titleBox.left,textRight,selected,devicePixelRatio].join(':')};
  }
  function fit(render=true){
   const {heroBox,gutter,textRight,key}=geometry();layoutKey=key;
   focusLeft=Math.min(heroBox.width-80,textRight-heroBox.left+gutter);
   if(selected==='B'){canvas.style.left='0px';canvas.style.right='0px';canvas.style.width='100%';canvas.style.marginLeft='0px';}
   else if(heroBox.width>700){canvas.style.left=focusLeft+'px';canvas.style.right='0px';canvas.style.width='calc(100% - '+focusLeft+'px)';canvas.style.marginLeft='0px';}
   else{canvas.style.left='';canvas.style.right='';canvas.style.width=heroBox.width+'px';canvas.style.marginLeft=-gutter+'px';}
   const box=canvas.getBoundingClientRect();width=box.width;height=box.height;
   const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
   if(render){draw(performance.now(),0);start();}
  }
  function draw(now,elapsed){
   if(geometry().key!==layoutKey)fit(false);
   if(!width||!height)return;
   const reduced=motion.matches,spectrum=reduced?null:window.readMusicSpectrum?.();let low=0,mid=0,high=0,energy=0,rawLow=0,lowPeak=0,rawHigh=0;
   for(let i=0;i<28;i++){const raw=spectrum?.[i]||0,value=clamp(Math.pow(raw,.8)*1.3);bands[i]+=(value-bands[i])*(value>bands[i]?.72:.2);energy+=bands[i]*bands[i];if(i<6){low+=bands[i];rawLow+=raw;lowPeak=Math.max(lowPeak,raw);}else if(i<21)mid+=bands[i];else{high+=bands[i];rawHigh+=raw;}}
   bass=low/6;mids=mid/15;treble=high/7;energy=Math.sqrt(energy/28);
   const kickInput=rawLow/6*.65+lowPeak*.35,highInput=rawHigh/7;bassFloor+=(kickInput-bassFloor)*.04;
   beat*=Math.exp(-elapsed/300);trebleHit*=Math.exp(-elapsed/180);
   if(!reduced&&kickInput>.14&&kickInput-previousBass>.035&&kickInput>bassFloor*1.04&&now-lastBeat>180){beat=1;sequence++;lastBeat=now;}
   if(!reduced&&highInput>.1&&highInput-previousHigh>.025&&now-lastHigh>110){trebleHit=1;lastHigh=now;}
   previousBass=kickInput;previousHigh=highInput;
   const active=energy>.015;if(!reduced)clock+=elapsed*(active?.0002+energy*.00065:.000045);
   pointer.strength=reduced?0:clamp(1-(now-pointer.time)/1100);
   ctx.clearRect(0,0,width,height);ctx.save();

   while(pointerTrail.length&&now-pointerTrail[0].time>1400)pointerTrail.shift();
   if(selected==='B'&&drawB){drawB(ctx,{width,height,clock,bass,mids,treble,beat,bands,pointer,trail:pointerTrail,reduced,now,elapsed,sequence,trebleHit,focusLeft});}else{
   const lineColor=document.body.classList.contains('dark-mode')?'#000000':'#ffffff';
   ctx.fillStyle=lineColor;ctx.fillRect(0,0,width,height);canvas.dataset.lineColor=lineColor;
   const rowCount=12,rowHeight=height/rowCount,gap=Math.max(1.5,width*.003);
   // Smooth envelopes drive travelling waves: no fixed frequency-to-streak roles.
   for(let i=0;i<28;i++){const target=bands[i],tau=target>streakBands[i]?120:420;streakBands[i]+=(target-streakBands[i])*(1-Math.exp(-elapsed/tau));}
   dancePulse+=(beat-dancePulse)*(1-Math.exp(-elapsed/(beat>dancePulse?100:330)));
   if(!reduced)streakClock+=elapsed*(active?.00022+energy*.00042:.00004);
   for(let row=0;row<rowCount;row++){
    const y=row*rowHeight,ny=(row+.5)/rowCount;
    const bend=pointer.strength*Math.exp(-Math.pow((ny-pointer.y)*4,2))*(pointer.x-.5)*.45;
    const rowPhase=streakClock*(1+row*.035)+row*.55;
    const targetOffset=Math.sin(rowPhase)*(.025+energy*.105)+Math.sin(rowPhase*1.7-row*.22)*dancePulse*.055+bend*.7;
    streakOffsets[row]+=(targetOffset-streakOffsets[row])*(1-Math.exp(-elapsed/170));
    const offset=streakOffsets[row];
    const count=8,weights=[];let total=0;
    for(let col=0;col<count;col++){
     const band=streakBands[(row*3+col*5)%28];
     const wave=Math.sin(streakClock*1.25-col*.9+row*.38);
     const counterwave=Math.cos(streakClock*.73+col*1.7-row*.27);
     const target=(1.1+wave*(.24+energy*.58)+counterwave*.2)*(1+band*1.6+dancePulse*(.6+.5*Math.sin(col*.9-row*.45)));
     const index=row*count+col;
     if(!streakWidths[index])streakWidths[index]=target;
     streakWidths[index]+=(target-streakWidths[index])*(1-Math.exp(-elapsed/130));
     const weight=streakWidths[index];weights.push(weight);total+=weight;
    }
    let x=-width*.23+offset*width;
    for(let col=0;col<count;col++){
     const w=weights[col]/total*width*1.48;ctx.fillStyle=colors[(col+Math.floor(row/2))%colors.length];ctx.fillRect(x+gap/2,y+gap/2,w-gap,rowHeight-gap);
     x+=w;
    }
   }
   ctx.fillStyle=lineColor;ctx.fillRect(0,0,Math.max(1.5,width*.003),height);
   }
   ctx.restore();canvas.dataset.energy=energy.toFixed(3);canvas.dataset.bass=bass.toFixed(3);canvas.dataset.mids=mids.toFixed(3);canvas.dataset.treble=treble.toFixed(3);canvas.dataset.beat=beat.toFixed(3);canvas.dataset.trebleHit=trebleHit.toFixed(3);canvas.dataset.mode=reduced?'still':active?'audio':'idle';canvas.dataset.shape='rectangle';canvas.dataset.visualizer=selected;
  }
  function tick(now){frame=0;if(destroyed||!visible||document.hidden||motion.matches)return;const elapsed=now-last;if(elapsed>=(selected==='A'?16:32)){draw(now,Math.min(elapsed,80));last=now;}frame=requestAnimationFrame(tick);}
  function start(){if(!frame&&!destroyed&&visible&&!document.hidden&&!motion.matches){last=performance.now();frame=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(frame);frame=0;}
  const observer=new ResizeObserver(()=>fit());observer.observe(canvas);observer.observe(hero);observer.observe(hero.querySelector('#hero-title'));
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();});intersection.observe(hero);
  hero.addEventListener('pointermove',e=>{
   if(motion.matches||e.pointerType==='touch')return;
   const r=canvas.getBoundingClientRect(),inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom,now=performance.now();
   pointer={x:clamp((e.clientX-r.left)/r.width),y:clamp((e.clientY-r.top)/r.height),strength:1,time:inside?now:0};
   if(inside){
    const previous=pointerTrail[pointerTrail.length-1],distance=previous?Math.hypot((pointer.x-previous.x)*r.width,(pointer.y-previous.y)*r.height):0;
    if(!previous||now-previous.time>90){pointerTrail.push({...pointer,time:now});}
    else if(distance>5){const steps=Math.min(12,Math.ceil(distance/10));for(let i=1;i<=steps;i++)pointerTrail.push({x:previous.x+(pointer.x-previous.x)*i/steps,y:previous.y+(pointer.y-previous.y)*i/steps,time:now});}
    if(pointerTrail.length>90)pointerTrail.splice(0,pointerTrail.length-90);
   }start();
  },{passive:true,signal:events.signal});
  window.addEventListener('resize',()=>fit(),{passive:true,signal:events.signal});
  window.visualViewport?.addEventListener('resize',()=>fit(),{passive:true,signal:events.signal});
  document.fonts?.ready.then(()=>{if(!destroyed)fit();});
  const themeObserver=new MutationObserver(()=>{if(motion.matches)draw(performance.now(),0);});themeObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();},{signal:events.signal});
  motion.addEventListener('change',()=>{stop();bands.fill(0);pointerTrail.length=0;beat=0;trebleHit=0;previousBass=0;previousHigh=0;bassFloor=0;draw(performance.now(),0);start();},{signal:events.signal});fit();
  dispose=()=>{destroyed=true;stop();observer.disconnect();themeObserver.disconnect();intersection.disconnect();events.abort();canvas.remove();selector.remove();hero.classList.remove('has-mosaic');delete hero.dataset.visualizer;};
 }
 window.addEventListener('pagenavigate',mount);mount();
})();
