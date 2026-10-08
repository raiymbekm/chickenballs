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
  import('./visualizer-b.js?v=20261008-full-header-1').then(module=>{if(destroyed)return;drawB=module.drawLiquidGrid;buttons[1].disabled=false;buttons[1].title='Liquid bloom';let preferred;try{preferred=localStorage.getItem('chicken-balls-visualizer');}catch{}choose(new URLSearchParams(location.search).get('visualizer')||preferred||'A');}).catch(()=>{});
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController(),bands=new Float32Array(28);
  let width=0,height=0,frame=0,last=0,clock=0,visible=true,destroyed=false,bass=0,mids=0,treble=0,beat=0,previousBass=0,lastBeat=0,sequence=0;
  const pointerTrail=[];
  let pointer={x:.5,y:.5,strength:0,time:0};const clamp=n=>Math.max(0,Math.min(1,n));
  function fit(){
   const heroBox=hero.getBoundingClientRect(),titleBox=hero.querySelector('#hero-title').getBoundingClientRect();
   const gutter=titleBox.left-heroBox.left;
   if(selected==='B'){canvas.style.left='0px';canvas.style.width=heroBox.width+'px';canvas.style.marginLeft='0px';}else if(heroBox.width>700){const left=titleBox.right-heroBox.left+gutter;canvas.style.left=left+'px';canvas.style.width=Math.max(80,heroBox.width-left)+'px';canvas.style.marginLeft='';}else{canvas.style.left='';canvas.style.width=heroBox.width+'px';canvas.style.marginLeft=-gutter+'px';}
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

   while(pointerTrail.length&&now-pointerTrail[0].time>1400)pointerTrail.shift();
   if(selected==='B'&&drawB){drawB(ctx,{width,height,clock,bass,mids,treble,beat,bands,pointer,trail:pointerTrail,reduced,now,elapsed,sequence});}else{
   const lineColor=document.body.classList.contains('dark-mode')?'#000000':'#ffffff';
   ctx.fillStyle=lineColor;ctx.fillRect(0,0,width,height);canvas.dataset.lineColor=lineColor;
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
     x+=w;
    }
   }
   ctx.fillStyle=lineColor;ctx.fillRect(0,0,Math.max(1.5,width*.003),height);
   }
   ctx.restore();canvas.dataset.energy=energy.toFixed(3);canvas.dataset.bass=bass.toFixed(3);canvas.dataset.mids=mids.toFixed(3);canvas.dataset.treble=treble.toFixed(3);canvas.dataset.beat=beat.toFixed(3);canvas.dataset.mode=reduced?'still':active?'audio':'idle';canvas.dataset.shape='rectangle';canvas.dataset.visualizer=selected;
  }
  function tick(now){frame=0;if(destroyed||!visible||document.hidden||motion.matches)return;const elapsed=now-last;if(elapsed>=32){draw(now,Math.min(elapsed,80));last=now;}frame=requestAnimationFrame(tick);}
  function start(){if(!frame&&!destroyed&&visible&&!document.hidden&&!motion.matches){last=performance.now();frame=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(frame);frame=0;}
  const observer=new ResizeObserver(fit);observer.observe(canvas);observer.observe(hero);observer.observe(hero.querySelector('#hero-title'));
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
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();},{signal:events.signal});
  motion.addEventListener('change',()=>{stop();bands.fill(0);pointerTrail.length=0;beat=0;draw(performance.now(),0);start();},{signal:events.signal});fit();
  dispose=()=>{destroyed=true;stop();observer.disconnect();intersection.disconnect();events.abort();canvas.remove();selector.remove();hero.classList.remove('has-mosaic');delete hero.dataset.visualizer;};
 }
 window.addEventListener('pagenavigate',mount);mount();
})();
