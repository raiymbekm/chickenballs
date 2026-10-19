// Visualizer A: exactly two independent, opaque pixel blooms. The module filename
// remains stable for existing deployments; the selector maps it to A.
const states=new WeakMap();
const clamp=value=>Math.max(0,Math.min(1,value));
export function drawLiquidGrid(ctx,{width,height,bass,mids,treble,beat,reduced,now,elapsed,trail,trebleHit=0,focusLeft=0}){
 let state=states.get(ctx.canvas);if(!state){state={time:0};states.set(ctx.canvas,state);}
 const playing=bass+mids+treble>.035;
 if(!reduced)state.time+=elapsed*.001*(playing?.85+bass*1.8+mids*1.1:.4);
 const t=reduced?0:state.time,scale=Math.min(width,height);
 const cols=Math.max(20,Math.min(90,Math.round(width/19))),rows=Math.max(16,Math.round(height/(width/cols)));
 const cw=width/cols,ch=height/rows;
 const palette=['#34c978','#ffc42e','#f94a40','#4c63e5','#34c978','#f94a40'];
 // Two drifting centres, kept apart so the blooms never merge into one form.
 const centres=[
  {x:width*(.74+.035*Math.sin(t*.43)),y:height*(.24+.055*Math.cos(t*.51)),phase:0},
  {x:width*(.9+.035*Math.cos(t*.37)),y:height*(.8+.055*Math.sin(t*.47)),phase:2.7}
 ];
 const separation=Math.hypot(centres[0].x-centres[1].x,centres[0].y-centres[1].y);
 const maxRadius=Math.min(scale*.4,separation*.43);
 const blooms=centres.map((centre,i)=>{
  const phase=t+centre.phase;
  const expansion=clamp(.28+bass*.42+beat*.48+mids*.1);
  const core=maxRadius/scale/1.45*(.68+expansion*.32)*(1-i*.07);
  return {...centre,phase,core,morph:(1-Math.cos(phase*.64))*.5};
 });
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
  let fill=null;
  for(let b=0;b<blooms.length;b++){
  const bloom=blooms[b],{core,morph}=bloom,phase=bloom.phase;
  const dx=(x-bloom.x)/scale,dy=(y-bloom.y)/scale;
  // Keep a clear gap even on a kick. Cursor movement refracts only these two bodies.
  if(Math.hypot(dx,dy)>maxRadius/scale)continue;
  const wx=dx*(1+.1*Math.sin(phase*.57))+nx*wake*.055;
  const wy=dy*(1+.1*Math.cos(phase*.71))+ny*wake*.055;
  const angle=Math.atan2(wy,wx),distance=Math.hypot(wx,wy);
  // Independently breathing folds change their strength and phase, rather than rotating one silhouette.
  const organic=1+(.1+.13*Math.sin(phase*.47))*Math.sin(angle*2+.6*Math.sin(phase*.81))
   +(.12+.1*Math.cos(phase*.59))*Math.cos(angle*4+.8*Math.cos(phase*.67))
   +(.06+.06*Math.sin(phase*.73))*Math.sin(angle*7+phase*.51);
  const clover=1+.28*Math.cos(angle*3+phase*.34)+.035*Math.sin(angle*6-phase*.6);
  const edgeRipple=core*(treble*.14+trebleHit*.23)*Math.sin(angle*16-phase*9+distance*9);
  const petal=core*(clover*(1-morph)+organic*morph)+edgeRipple;
  if(distance>=petal)continue;
  // Bass pushes broad concentric bands from the centre; highs ripple the perimeter.
  const edgeWeight=clamp(distance/core);
  const flow=distance/core*(2.1-beat*.85-bass*.45)+.24*Math.sin(wx*5+phase*.91)+.27*Math.cos(wy*4-phase*.73)
   +.2*Math.sin(wx*3+wy*4+phase*.61)+phase*.23
   +beat*.44*Math.sin(distance*8-phase*3)+edgeWeight*edgeWeight*(treble*.22+trebleHit*.46)*Math.cos(angle*16-phase*9)+wake*.8;
  const index=((Math.floor(flow*3+b*2)%palette.length)+palette.length)%palette.length;
  fill=palette[index];
  }
  if(fill){
   ctx.globalAlpha=1;ctx.fillStyle=fill;
   ctx.fillRect(Math.round(gx*cw),Math.round(gy*ch),Math.round((gx+1)*cw)-Math.round(gx*cw),Math.round((gy+1)*ch)-Math.round(gy*ch));
  }
 }
 ctx.globalAlpha=1;
 ctx.canvas.dataset.ripples=trebleHit.toFixed(2);ctx.canvas.dataset.trail=String(points.length);ctx.canvas.dataset.effect='twin-liquid-blooms';ctx.canvas.dataset.blobs='2';
}
