// Visualizer A: exactly two independent, opaque pixel blooms. The module filename
// remains stable for existing deployments; the selector maps it to A.
const states=new WeakMap();
const clamp=value=>Math.max(0,Math.min(1,value));
export function drawLiquidGrid(ctx,{width,height,bass,mids,treble,beat,reduced,now,elapsed,trail,trebleHit=0,focusLeft=0,sequence=0}){
 let state=states.get(ctx.canvas);if(!state){state={time:0,music:0,pulse:0,high:0};states.set(ctx.canvas,state);}
 const playing=bass+mids+treble>.035;
 if(!reduced)state.time+=elapsed*.001*(playing?1.05+bass*2.1+mids*1.3:.65);
 state.music+=((playing&&!reduced?1:0)-state.music)*(1-Math.exp(-elapsed/(playing?160:650)));
 state.pulse+=((reduced?0:beat)-state.pulse)*(1-Math.exp(-elapsed/(beat>state.pulse?95:340)));
 state.high+=((reduced?0:trebleHit)-state.high)*(1-Math.exp(-elapsed/(trebleHit>state.high?90:240)));
 const t=reduced?0:state.time,scale=Math.min(width,height);
 const cols=Math.max(20,Math.min(90,Math.round(width/19))),rows=Math.max(16,Math.round(height/(width/cols)));
 const cw=width/cols,ch=height/rows;
 const palette=['#34c978','#ffc42e','#f94a40','#4c63e5','#34c978','#f94a40'];
 // Original full-size blooms, not scaled down to fit two inside the header.
 // Their independent orbits let the large silhouettes spill beyond its edges.
 const centres=[
  {x:width*(.79+.085*Math.sin(t*.43)),y:height*(.04+.13*Math.cos(t*.57)),phase:0},
  {x:width*(.94+.075*Math.cos(t*.37)),y:height*(1.02+.13*Math.sin(t*.49)),phase:2.7}
 ];
 const blooms=centres.map((centre,i)=>{
  const phase=t+centre.phase;
  const breathing=i===0?.095*Math.sin(t*.81):.11*Math.cos(t*.67+2.1);
  const kick=state.pulse*(i===sequence%2?1:.72);
  const core=(i===0?.49:.47)+breathing+state.music*.13+bass*.25+mids*.07+kick*.36;
  return {...centre,phase,core,morph:(1-Math.cos(phase*.64))*.5};
 });
 const points=reduced?[]:trail.map(p=>({x:p.x*width,y:p.y*height,fade:clamp(1-(now-p.time)/1400)}));
 const segments=[];
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy;
  if(len2>1)segments.push({a,b,dx,dy,len2,fade:(a.fade+b.fade)/2});
 }
 const wakeWidth=Math.max(cw*.65,scale*.018);
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
  // No separation-based radius cap: both bodies can grow past the header on drops.
  const wx=dx*(1+.1*Math.sin(phase*.57))+nx*wake*.055;
  const wy=dy*(1+.1*Math.cos(phase*.71))+ny*wake*.055;
  const angle=Math.atan2(wy,wx),distance=Math.hypot(wx,wy);
  // Independently breathing folds change their strength and phase, rather than rotating one silhouette.
  // Broad, rounded lobes: high notes move the surface without growing needle-like spikes.
  const organic=1+(.13+.07*Math.sin(phase*.47))*Math.sin(angle*2+.6*Math.sin(phase*.81))
   +(.08+.05*Math.cos(phase*.59))*Math.cos(angle*4+.8*Math.cos(phase*.67))
   +.035*Math.sin(angle*3+phase*.51);
  const clover=1+.2*Math.cos(angle*3+phase*.34)+.02*Math.sin(angle*6-phase*.6);
  const edgeRipple=core*(treble*.012+state.high*.018)*Math.sin(angle*6-phase*3+distance*3);
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
  // A thin, connected pixel ribbon follows the pointer anywhere in the header.
  // Only two autonomous blooms are generated; this third field exists solely on input.
  if(!fill&&wake>.34)fill=palette[((Math.floor(t*.8+x/(cw*4)+y/(ch*5))%palette.length)+palette.length)%palette.length];
  if(fill){
   ctx.globalAlpha=1;ctx.fillStyle=fill;
   ctx.fillRect(Math.round(gx*cw),Math.round(gy*ch),Math.round((gx+1)*cw)-Math.round(gx*cw),Math.round((gy+1)*ch)-Math.round(gy*ch));
  }
 }
 ctx.globalAlpha=1;
 ctx.canvas.dataset.ripples=trebleHit.toFixed(2);ctx.canvas.dataset.trail=String(points.length);ctx.canvas.dataset.effect='twin-liquid-blooms';ctx.canvas.dataset.blobs='2';
 ctx.canvas.dataset.bloomSizes=blooms.map(b=>b.core.toFixed(3)).join(',');
 ctx.canvas.dataset.bloomCentres=blooms.map(b=>`${b.x.toFixed(0)},${b.y.toFixed(0)}`).join(';');
}
