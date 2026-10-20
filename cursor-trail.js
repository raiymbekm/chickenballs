(() => {
 if(document.querySelector('.site-cursor-trail'))return;
 const canvas=document.createElement('canvas');canvas.className='site-cursor-trail';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
 const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return;}
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),palette=['#6322f2','#27d47b','#ffc42e','#f94a40','#2563eb'];
 const cells=new Map();let frame=0,previous=null,width=0,height=0,size=14,sequence=0;
 const lifetime=1000;
 function clear(){cancelAnimationFrame(frame);frame=0;cells.clear();previous=null;ctx.clearRect(0,0,width,height);canvas.dataset.tiles='0';}
 function fit(){const ratio=Math.min(devicePixelRatio||1,2);width=innerWidth;height=innerHeight;size=width<700?12:14;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);clear();}
 function draw(now){frame=0;ctx.clearRect(0,0,width,height);
  for(const [key,tile] of cells){const fade=1-(now-tile.time)/lifetime;if(fade<=0){cells.delete(key);continue;}ctx.globalAlpha=fade*fade*.85;ctx.fillStyle=tile.color;ctx.fillRect(tile.x*size,tile.y*size,size,size);}
  ctx.globalAlpha=1;canvas.dataset.tiles=String(cells.size);if(cells.size)frame=requestAnimationFrame(draw);
 }
 function mark(x,y,time){const gx=Math.floor(x/size),gy=Math.floor(y/size),key=gx+':'+gy;cells.set(key,{x:gx,y:gy,time,color:palette[Math.floor(sequence++/3)%palette.length]});if(cells.size>180)cells.delete(cells.keys().next().value);}
 document.addEventListener('pointermove',event=>{
  if(motion.matches||event.pointerType==='touch'||document.hidden)return;
  const x=event.clientX,y=event.clientY,now=performance.now();
  if(previous&&now-previous.time<120){const dx=x-previous.x,dy=y-previous.y,steps=Math.min(80,Math.ceil(Math.hypot(dx,dy)/(size*.45)));for(let i=1;i<=steps;i++)mark(previous.x+dx*i/steps,previous.y+dy*i/steps,now);}
  else mark(x,y,now);
  previous={x,y,time:now};if(!frame)frame=requestAnimationFrame(draw);
 },{passive:true});
 window.addEventListener('resize',fit,{passive:true});window.addEventListener('scroll',clear,{passive:true});window.addEventListener('blur',clear);window.addEventListener('pagenavigate',clear);document.addEventListener('pointerleave',()=>{previous=null;});document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});motion.addEventListener('change',clear);fit();
})();
