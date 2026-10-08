// Large continuous fluid field. Bass changes the bloom itself, with no detached particles.
const states=new WeakMap();
const clamp=value=>Math.max(0,Math.min(1,value));
export function drawLiquidGrid(ctx,{width,height,bass,mids,treble,beat,reduced,now,elapsed,trail,trebleHit=0,focusLeft=0}){
 let state=states.get(ctx.canvas);if(!state){state={time:0};states.set(ctx.canvas,state);}
 const playing=bass+mids+treble>.035;
 if(!reduced)state.time+=elapsed*.001*(playing?.5+bass*1.4+mids*.9:.13);
 const t=reduced?0:state.time,scale=Math.min(width,height);
 const cols=Math.max(20,Math.min(90,Math.round(width/19))),rows=Math.max(16,Math.round(height/(width/cols)));
 const cw=width/cols,ch=height/rows;
 const palette=['#bcff35','#f5a623','#fd5439','#3d52df','#bcff35','#fd5439'];
 // The bloom is larger than the header and is deliberately cropped by its edges.
 const cx=width*(.91+.035*Math.sin(t*.62)),cy=height*(.5+.13*Math.cos(t*.51));
 const core=.82+bass*.22+beat*.42;
 const points=reduced?[]:trail.map(p=>({x:p.x*width,y:p.y*height,fade:clamp(1-(now-p.time)/1400)}));
 const segments=[];
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy;
  if(len2>1)segments.push({a,b,dx,dy,len2,fade:(a.fade+b.fade)/2});
 }
 const wakeWidth=Math.max(cw*1.3,scale*.045);
 for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){
  const x=(gx+.5)*cw,y=(gy+.5)*ch;
  let wake=0,nx=0,ny=0;
  // A connected refractive wake bends the existing fluid, rather than painting colored dots.
  for(const segment of segments){
   const {a,b,dx,dy,len2,fade}=segment;
   if(x<Math.min(a.x,b.x)-wakeWidth*2||x>Math.max(a.x,b.x)+wakeWidth*2||y<Math.min(a.y,b.y)-wakeWidth*2||y>Math.max(a.y,b.y)+wakeWidth*2)continue;
   const u=clamp(((x-a.x)*dx+(y-a.y)*dy)/len2),px=a.x+u*dx,py=a.y+u*dy;
   const dist2=(x-px)**2+(y-py)**2,influence=Math.exp(-dist2/(wakeWidth*wakeWidth))*fade*fade;
   if(influence>wake){wake=influence;const length=Math.sqrt(len2);nx=-dy/length;ny=dx/length;}
  }
  const dx=(x-cx)/scale,dy=(y-cy)/scale;
  const wx=dx+(.045+mids*.07)*Math.sin(dy*7+t*1.6)+trebleHit*.07*Math.sin(dy*21+t*3)+nx*wake*.18;
  const wy=dy+(.045+mids*.07)*Math.sin(dx*6-t*1.3)+trebleHit*.07*Math.sin(dx*19-t*3)+ny*wake*.18;
  const angle=Math.atan2(wy,wx),distance=Math.hypot(wx,wy);
  const petal=core*(1+.23*Math.sin(angle*5+t)+.13*Math.cos(angle*3-t*1.4));
  let alpha=clamp((petal-distance)*18);
  const flow=distance/core*2.2+.32*Math.sin(angle*3-t*1.4)+t*.15
   +beat*.42*Math.sin(distance*8-t*2)+trebleHit*.32*Math.cos(angle*8+t*3)+wake*.8;
  const index=((Math.floor(flow*3)%palette.length)+palette.length)%palette.length;
  // A little fluid is pulled into the wake at the edge; it fades as one ribbon.
  alpha=Math.max(alpha,wake*.8);
  if(alpha>.02){
   // Gradual shading toward the text keeps the headline readable without rectangular masks.
   const reveal=width>700?clamp((x-focusLeft+width*.025)/(width*.09)):1;
   const shade=reveal*reveal*(3-2*reveal);
   ctx.globalAlpha=alpha*shade;ctx.fillStyle=palette[index];
   ctx.fillRect(Math.round(gx*cw),Math.round(gy*ch),Math.round((gx+1)*cw)-Math.round(gx*cw),Math.round((gy+1)*ch)-Math.round(gy*ch));
  }
 }
 ctx.globalAlpha=1;
 ctx.canvas.dataset.ripples='0';ctx.canvas.dataset.trail=String(points.length);ctx.canvas.dataset.effect='oversized-fluid-wake';
}
