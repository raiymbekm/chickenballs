(() => {
 let dispose=()=>{};
 function mount(){
  dispose();
  const hero=document.querySelector('.hero');if(!hero)return;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  canvas.className='hero-mosaic';canvas.setAttribute('aria-hidden','true');hero.prepend(canvas);hero.classList.add('has-mosaic');
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController();
  let width=0,height=0,cols=0,rows=0,cells=[],frame=0,last=0,visible=true,destroyed=false,energy=0,bass=0,phase=0;
  const trail=[],bands=new Float32Array(28);
  const noise=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
  function fit(){
   const box=hero.getBoundingClientRect();width=box.width;height=box.height;
   const preferred=width<600?34:64;
   cols=Math.max(1,Math.round(width/preferred));rows=Math.max(1,Math.round(height/preferred));
   // Divide the entire header into whole cells, with no cropped edge tiles.
   const cellWidth=width/cols,cellHeight=height/rows;
   const range=document.createRange(),textNodes=document.createTreeWalker(hero.querySelector('h1'),NodeFilter.SHOW_TEXT),quietRects=[];
   while(textNodes.nextNode()){
    range.selectNodeContents(textNodes.currentNode);
    quietRects.push(...Array.from(range.getClientRects(),r=>({left:r.left-box.left,right:r.right-box.left,top:r.top-box.top,bottom:r.bottom-box.top})));
   }
   const captions=Array.from(hero.querySelectorAll('.hero-top,.hero-bottom'),el=>{const r=el.getBoundingClientRect();return{left:r.left-box.left,right:r.right-box.left,top:r.top-box.top,bottom:r.bottom-box.top};});
   const intersects=(x,y,w,h,r)=>x<r.right&&x+w>r.left&&y+h>r.top&&y<r.bottom;
   cells=[];
   for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){
    const x=Math.round(gx*cellWidth),y=Math.round(gy*cellHeight),w=Math.round((gx+1)*cellWidth)-x,h=Math.round((gy+1)*cellHeight)-y;
    cells.push({x,y,w,h,gx,gy,n:noise(gx,gy),quiet:quietRects.some(r=>intersects(x,y,w,h,r)),caption:captions.some(r=>intersects(x,y,w,h,r))});
   }
   const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
   canvas.dataset.columns=String(cols);canvas.dataset.rows=String(rows);canvas.dataset.cellSize=`${cellWidth.toFixed(2)} × ${cellHeight.toFixed(2)}`;
   draw(performance.now(),0);start();
  }
  function draw(now,elapsed){
   ctx.clearRect(0,0,width,height);
   const reduced=motion.matches,spectrum=!reduced&&window.readMusicSpectrum?.();
   let sum=0,low=0;
   for(let i=0;i<28;i++){
    const value=spectrum?.[i]||0;bands[i]+=(value-bands[i])*.32;sum+=bands[i]*bands[i];if(i<10)low+=bands[i];
   }
   energy=Math.min(1,Math.sqrt(sum/28)*1.65);bass=low/10;
   // A slow current remains visible at rest; the actual spectrum drives brightness and speed.
   if(!reduced)phase+=elapsed*(.00035+energy*.0014);
   while(trail.length&&now-trail[0].time>1100)trail.shift();
   for(const cell of cells){
    const {x,y,w,h,gx,gy,n,quiet,caption}=cell;
    const nx=gx/cols,ny=gy/rows,band=bands[Math.min(27,Math.floor(nx*28))];
    let proximity=0;
    if(!reduced)for(const point of trail){const distance=Math.hypot((x+w/2-point.x)/w,(y+h/2-point.y)/h);proximity=Math.max(proximity,Math.max(0,1-distance/4)*(1-(now-point.time)/1100));}
    const wave=(Math.sin(nx*11+ny*5-phase*2)+Math.sin(nx*5-ny*9+phase*1.3)+2)/4;
    const current=(Math.sin(ny*12-nx*7+phase)+1)/2;
    const response=Math.min(1,band*.9+energy*.55+bass*.25);
    let color='#4b16a6';
    if(wave>.46)color='#9754f5';
    if(wave>.69)color='#c18bff';
    if(wave<.23)color='#38117d';
    if(n>.88&&current>.68||response>.35&&n>.72&&current>.4)color='#bcff35';
    if(response>.68&&n>.84)color='#f7f7f2';
    if(proximity>.22)color=proximity>.58?'#bcff35':'#e0bdff';
    ctx.fillStyle=color;
    const density=.24+nx*.22+ny*.25;
    ctx.globalAlpha=(caption?.16:quiet?.48:1)*Math.min(.96,density+wave*.24+response*.38+proximity*.5);
    ctx.fillRect(x,y,w,h);
    ctx.strokeStyle='#7028dd';ctx.lineWidth=1;ctx.globalAlpha*=.45;ctx.strokeRect(x+.5,y+.5,w-1,h-1);
   }
   ctx.globalAlpha=1;
   canvas.dataset.energy=energy.toFixed(3);canvas.dataset.bass=bass.toFixed(3);canvas.dataset.pointer=String(!reduced&&trail.length>0);canvas.dataset.motion=reduced?'reduced':'active';
  }
  function tick(now){frame=0;if(destroyed||!visible||document.hidden||motion.matches)return;const elapsed=now-last;if(elapsed>32){draw(now,Math.min(elapsed,80));last=now;}frame=requestAnimationFrame(tick);}
  function start(){if(!frame&&!destroyed&&visible&&!document.hidden&&!motion.matches){last=performance.now();frame=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(frame);frame=0;}
  const observer=new ResizeObserver(fit);observer.observe(hero);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();});intersection.observe(hero);
  hero.addEventListener('pointermove',event=>{if(motion.matches||event.pointerType==='touch')return;const r=hero.getBoundingClientRect(),x=event.clientX-r.left,y=event.clientY-r.top,previous=trail[trail.length-1];if(!previous||Math.hypot(previous.x-x,previous.y-y)>12){trail.push({x,y,time:performance.now()});if(trail.length>24)trail.shift();}start();},{passive:true,signal:events.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();},{signal:events.signal});
  motion.addEventListener('change',()=>{stop();trail.length=0;bands.fill(0);energy=0;bass=0;draw(performance.now(),0);start();},{signal:events.signal});
  document.fonts?.ready.then(()=>{if(!destroyed)fit();});fit();
  dispose=()=>{destroyed=true;stop();observer.disconnect();intersection.disconnect();events.abort();canvas.remove();hero.classList.remove('has-mosaic');};
 }
 window.addEventListener('pagenavigate',mount);mount();
})();
