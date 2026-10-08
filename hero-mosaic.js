(() => {
 let dispose=()=>{};
 function mount(){
  dispose();
  const hero=document.querySelector('.hero');if(!hero)return;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  canvas.className='hero-mosaic';canvas.setAttribute('aria-hidden','true');hero.prepend(canvas);hero.classList.add('has-mosaic');
  const mask=document.createElement('canvas'),maskCtx=mask.getContext('2d',{willReadFrequently:true});
  const logo=new Image();logo.src='assets/chicken-balls-logo.svg';
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController();
  let width=0,height=0,tile=36,cols=0,rows=0,cells=[],quietRects=[],frame=0,last=0,visible=true,destroyed=false,bass=0;
  const pointer={x:-1000,y:-1000,active:false},trail=[],bands=new Float32Array(28);
  const noise=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
  function fit(){
   const box=hero.getBoundingClientRect();width=box.width;height=box.height;
   tile=width<600?22:Math.max(30,Math.min(48,Math.round(width/35)));
   cols=Math.ceil(width/tile);rows=Math.ceil(height/tile);
   const heading=hero.querySelector('h1'),range=document.createRange(),textNodes=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
   quietRects=[];
   while(textNodes.nextNode()){
    range.selectNodeContents(textNodes.currentNode);
    quietRects.push(...Array.from(range.getClientRects(),r=>({left:r.left-box.left,right:r.right-box.left,top:r.top-box.top,bottom:r.bottom-box.top})));
   }
   const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
   mask.width=cols;mask.height=rows;maskCtx.clearRect(0,0,cols,rows);
   // Sample the original logo on a coarse grid: every visible cell is a square.
   const logoWidth=cols*(width<600?.72:.64),logoHeight=logoWidth/1.677;
   if(logo.complete&&logo.naturalWidth)maskCtx.drawImage(logo,cols*.58,rows*.48-logoHeight*.5,logoWidth,logoHeight);
   const pixels=maskCtx.getImageData(0,0,cols,rows).data;
   const occupied=(x,y)=>x>=0&&y>=0&&x<cols&&y<rows&&pixels[(y*cols+x)*4+3]>80;
   cells=[];
   for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const inside=occupied(x,y),near=occupied(x-1,y)||occupied(x+1,y)||occupied(x,y-1)||occupied(x,y+1),n=noise(x,y);
    if(inside||near&&n>.57||x>cols*.67&&n>.955)cells.push({x:x*tile,y:y*tile,gx:x,gy:y,n,inside,edge:inside&&(!occupied(x-1,y)||!occupied(x+1,y)||!occupied(x,y-1)||!occupied(x,y+1))});
   }
   draw(performance.now());start();
  }
  function draw(now){
   ctx.clearRect(0,0,width,height);
   const reduced=motion.matches,spectrum=!reduced&&window.readMusicSpectrum?.();
   for(let i=0;i<28;i++)bands[i]+=((spectrum?.[i]||0)-bands[i])*.14;
   bass+=(bands.slice(0,7).reduce((a,b)=>a+b,0)/7-bass)*.12;
   while(trail.length&&now-trail[0].time>850)trail.shift();
   for(const cell of cells){
    const {x,y,gx,gy,n,inside,edge}=cell;
    const band=bands[(gx*3+gy*2)%28],beat=bass*.48+band*.35;
    let proximity=0;
    if(!reduced){for(const point of trail){const distance=(Math.abs(x+tile/2-point.x)+Math.abs(y+tile/2-point.y))/tile;proximity=Math.max(proximity,Math.max(0,1-distance/4)*(1-(now-point.time)/850));}}
    const sweep=reduced?0:Math.sin(now*.00038+gx*.3-gy*.22)*.06;
    let color=inside?'#7738eb':'#302047';
    if(inside&&(gx+gy*2)%7<2)color='#3b2262';
    if(edge&&n>.56)color='#f7f7f2';
    if(inside&&n>.85||beat>.32&&n>.68)color='#bcff35';
    if(proximity>.28)color=proximity>.65?'#bcff35':'#b98aff';
    ctx.fillStyle=color;
    // Keep a calm area behind the lettering, even on compact screens.
    const behindText=quietRects.some(r=>x<r.right&&x+tile>r.left&&y+tile>r.top&&y<r.bottom);
    ctx.globalAlpha=(behindText?.12:1)*Math.min(1,(inside?.76:.35)+beat+proximity*.6+sweep);
    const shift=!reduced?Math.round(bass*1.5)*tile:0;
    ctx.fillRect(x,y-(inside&&n>.88?shift:0),tile-1,tile-1);
   }
   ctx.globalAlpha=1;
   canvas.dataset.bass=bass.toFixed(3);canvas.dataset.pointer=String(!reduced&&trail.length>0);canvas.dataset.motion=reduced?'reduced':'active';
  }
  function tick(now){frame=0;if(destroyed||!visible||document.hidden||motion.matches)return;if(now-last>32){draw(now);last=now;}frame=requestAnimationFrame(tick);}
  function start(){if(!frame&&!destroyed&&visible&&!document.hidden&&!motion.matches)frame=requestAnimationFrame(tick);}
  function stop(){cancelAnimationFrame(frame);frame=0;}
  const observer=new ResizeObserver(fit);observer.observe(hero);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();});intersection.observe(hero);
  hero.addEventListener('pointermove',event=>{if(motion.matches||event.pointerType==='touch')return;const r=hero.getBoundingClientRect();pointer.x=event.clientX-r.left;pointer.y=event.clientY-r.top;pointer.active=true;const previous=trail[trail.length-1];if(!previous||Math.abs(previous.x-pointer.x)+Math.abs(previous.y-pointer.y)>tile*.35){trail.push({x:pointer.x,y:pointer.y,time:performance.now()});if(trail.length>18)trail.shift();}start();},{passive:true,signal:events.signal});
  hero.addEventListener('pointerleave',()=>{pointer.active=false;},{signal:events.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();},{signal:events.signal});
  motion.addEventListener('change',()=>{stop();trail.length=0;bands.fill(0);bass=0;draw(performance.now());start();},{signal:events.signal});
  logo.onload=fit;document.fonts?.ready.then(()=>{if(!destroyed)fit();});fit();
  dispose=()=>{destroyed=true;stop();observer.disconnect();intersection.disconnect();events.abort();logo.onload=null;canvas.remove();hero.classList.remove('has-mosaic');};
 }
 window.addEventListener('pagenavigate',mount);mount();
})();
