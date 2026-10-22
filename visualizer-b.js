// Large continuous fluid field. Bass changes the bloom itself, with no detached particles.
const states=new WeakMap();
const clamp=value=>Math.max(0,Math.min(1,value));
export function drawLiquidGrid(ctx,{width,height,bass,mids,treble,beat,reduced,now,elapsed,trail,trebleHit=0,focusLeft=0,compact=false}){
 let state=states.get(ctx.canvas);if(!state){state={time:0};states.set(ctx.canvas,state);}
 const playing=bass+mids+treble>.035;
 if(!reduced)state.time+=elapsed*.001*(playing?.65+bass*1.4+mids*.9:.32);
 const t=reduced?0:state.time,scale=Math.min(width,height)*(compact?.68:1);
 const cols=Math.max(20,Math.min(90,Math.round(width/19))),rows=Math.max(16,Math.round(height/(width/cols)));
 const cw=width/cols,ch=height/rows;
 const palette=['#27d47b','#ffc42e','#f94a40','#2563eb','#27d47b','#f94a40'];
 // Both organisms keep the original scale and audio response, but their
 // deformation, internal flow, breathing, and travel use independent rhythms.
 const secondTime=t*.79+3.2;
 const blooms=[
  {cx:width*(.775+.035*Math.sin(t*.31)),cy:height*(.265+.08*Math.cos(t*.39)),time:t,morphRate:.55,breathRate:.53,breath:.035,rotation:0,hand:1,fold:.13,clover:.28},
  {cx:width*(.94+.032*Math.cos(secondTime*.23)+.012*Math.sin(secondTime*.71)),cy:height*(.85+.075*Math.sin(secondTime*.43)+.015*Math.cos(secondTime*.81)),time:secondTime,morphRate:.41,breathRate:.71,breath:.043,rotation:.55+.25*Math.sin(secondTime*.29),hand:-1,fold:.09,clover:.24}
 ];
 if(compact){
  blooms[0].cx=width*(.36+.07*Math.sin(t*.31));blooms[0].cy=height*(.79+.055*Math.cos(t*.39));
  blooms[1].cx=width*(.68+.065*Math.cos(secondTime*.23));blooms[1].cy=height*(.95+.05*Math.sin(secondTime*.43));
 }
 for(const bloom of blooms){bloom.cos=Math.cos(bloom.rotation);bloom.sin=Math.sin(bloom.rotation);}
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
  for(const bloom of blooms){
  const localTime=bloom.time,phase=localTime;
  const morph=(1-Math.cos(phase*bloom.morphRate))*.5;
  const core=.49+bloom.breath*Math.sin(phase*bloom.breathRate)+bass*.12+beat*.15;
  const ox=(x-bloom.cx)/scale,oy=(y-bloom.cy)/scale;
  const dx=(ox*bloom.cos+oy*bloom.sin)*bloom.hand,dy=-ox*bloom.sin+oy*bloom.cos;
  const wx=dx*(1+.15*Math.sin(localTime*.47)) +(.12+mids*.1)*Math.sin(dy*4.3+localTime*.91)*Math.cos(dx*2.1-localTime*.37)+trebleHit*.08*Math.sin(dy*21+localTime*3)+nx*wake*.22;
  const wy=dy*(1+.17*Math.cos(localTime*.61)) +(.11+mids*.1)*Math.sin(dx*4.8-localTime*.73)*Math.cos(dy*2.4+localTime*.43)+trebleHit*.08*Math.sin(dx*19-localTime*3)+ny*wake*.22;
  const angle=Math.atan2(wy,wx),distance=Math.hypot(wx,wy);
  // Independently breathing folds change their strength and phase, rather than rotating one silhouette.
  const organic=1+(.1+bloom.fold*Math.sin(localTime*.37))*Math.sin(angle*2+.6*Math.sin(localTime*.71))
   +(.12+.1*Math.cos(localTime*.49))*Math.cos(angle*4+.8*Math.cos(localTime*.57))
   +(.06+.06*Math.sin(localTime*.63))*Math.sin(angle*7+localTime*.41);
  const clover=1+bloom.clover*Math.cos(angle*3+localTime*.24)+.035*Math.sin(angle*6-localTime*.5);
  const edgeRipple=(treble*.035+trebleHit*.075)*Math.sin(angle*16-localTime*7+distance*9);
  const petal=core*(clover*(1-morph)+organic*morph)+edgeRipple;
  let alpha=clamp((petal-distance)*18);
  // Bass pushes broad concentric bands from the centre; highs ripple the perimeter.
  const edgeWeight=clamp(distance/core);
  const flow=distance/core*(2.1-beat*.65-bass*.3)+.24*Math.sin(wx*5+localTime*.81)+.27*Math.cos(wy*4-localTime*.63)
   +.2*Math.sin(wx*3+wy*4+localTime*.51)+localTime*.18
   +beat*.32*Math.sin(distance*8-localTime*2)+edgeWeight*edgeWeight*(treble*.15+trebleHit*.35)*Math.cos(angle*16-localTime*7)+wake*.8;
  const index=((Math.floor(flow*3)%palette.length)+palette.length)%palette.length;
  // A little fluid is pulled into the wake at the edge; it fades as one ribbon.
  alpha=Math.max(alpha,wake*.8);
  if(alpha>.5)fill=palette[index];
  }
  if(fill){
   ctx.globalAlpha=1;ctx.fillStyle=fill;
   ctx.fillRect(Math.round(gx*cw),Math.round(gy*ch),Math.round((gx+1)*cw)-Math.round(gx*cw),Math.round((gy+1)*ch)-Math.round(gy*ch));
  }
 }
 ctx.globalAlpha=1;
 ctx.canvas.dataset.ripples=trebleHit.toFixed(2);ctx.canvas.dataset.trail=String(points.length);ctx.canvas.dataset.effect='independent-twin-blooms';ctx.canvas.dataset.blobs='2';
}
