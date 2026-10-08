// Large continuous fluid field. Bass changes the bloom itself, with no detached particles.
const states=new WeakMap();
const clamp=value=>Math.max(0,Math.min(1,value));
export function drawLiquidGrid(ctx,{width,height,bass,mids,treble,beat,reduced,now,elapsed,trail,trebleHit=0,focusLeft=0}){
 let state=states.get(ctx.canvas);if(!state){state={time:0};states.set(ctx.canvas,state);}
 const playing=bass+mids+treble>.035;
 if(!reduced)state.time+=elapsed*.001*(playing?.65+bass*1.4+mids*.9:.32);
 const t=reduced?0:state.time,scale=Math.min(width,height);
 const cols=Math.max(20,Math.min(90,Math.round(width/19))),rows=Math.max(16,Math.round(height/(width/cols)));
 const cw=width/cols,ch=height/rows;
 const palette=['#bcff35','#f5a623','#fd5439','#3d52df','#bcff35','#fd5439'];
 // The bloom is larger than the header and is deliberately cropped by its edges.
 const cx=width*(.88+.065*Math.sin(t*.31)+.025*Math.sin(t*.83)),cy=height*(.48+.17*Math.cos(t*.39));
 const core=.88+.09*Math.sin(t*.53)+bass*.24+beat*.38;
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
  const wx=dx*(1+.15*Math.sin(t*.47)) +(.12+mids*.1)*Math.sin(dy*4.3+t*.91)*Math.cos(dx*2.1-t*.37)+trebleHit*.08*Math.sin(dy*21+t*3)+nx*wake*.22;
  const wy=dy*(1+.17*Math.cos(t*.61)) +(.11+mids*.1)*Math.sin(dx*4.8-t*.73)*Math.cos(dy*2.4+t*.43)+trebleHit*.08*Math.sin(dx*19-t*3)+ny*wake*.22;
  const angle=Math.atan2(wy,wx),distance=Math.hypot(wx,wy);
  // Independently breathing folds change their strength and phase, rather than rotating one silhouette.
  const petal=core*(1+(.1+.13*Math.sin(t*.37))*Math.sin(angle*2+.6*Math.sin(t*.71))
   +(.12+.1*Math.cos(t*.49))*Math.cos(angle*4+.8*Math.cos(t*.57))
   +(.06+.06*Math.sin(t*.63))*Math.sin(angle*7+t*.41)
   +beat*.13*Math.sin(angle*6-t*.8));
  let alpha=clamp((petal-distance)*18);
  const flow=distance/core*2.1+.24*Math.sin(wx*5+t*.81)+.27*Math.cos(wy*4-t*.63)
   +.2*Math.sin(wx*3+wy*4+t*.51)+t*.18
   +beat*.42*Math.sin(distance*8-t*2)+trebleHit*.32*Math.cos(angle*8+t*3)+wake*.8;
  const index=((Math.floor(flow*3)%palette.length)+palette.length)%palette.length;
  // A little fluid is pulled into the wake at the edge; it fades as one ribbon.
  alpha=Math.max(alpha,wake*.8);
  if(alpha>.5){
   ctx.globalAlpha=1;ctx.fillStyle=palette[index];
   ctx.fillRect(Math.round(gx*cw),Math.round(gy*ch),Math.round((gx+1)*cw)-Math.round(gx*cw),Math.round((gy+1)*ch)-Math.round(gy*ch));
  }
 }
 ctx.globalAlpha=1;
 ctx.canvas.dataset.ripples='0';ctx.canvas.dataset.trail=String(points.length);ctx.canvas.dataset.effect='oversized-fluid-wake';
}
