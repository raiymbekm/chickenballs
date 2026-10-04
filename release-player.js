(() => {
 const panel=document.getElementById('listening-room');
 const resize=document.createElement('button');resize.className='player-resize';resize.setAttribute('aria-label','Resize player. Drag or use arrow keys.');resize.title='Resize player';resize.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 4h3v17H4v-3h14zM12 10h3v5H9v-3h3z"/></svg>';panel.append(resize);
 let resizing=null;
 function size(w,h){const narrow=innerWidth<400;const minimumW=Math.min(narrow?320:380,innerWidth-24),minimumH=narrow?460:panel.classList.contains('is-horizontal')&&innerWidth>700?250:290;const r=panel.getBoundingClientRect(),horizontal=panel.classList.contains('is-horizontal');panel.style.width=Math.max(minimumW,Math.min(w,innerWidth-Math.max(r.left,12)-12))+'px';panel.style.height=Math.max(Math.min(minimumH,innerHeight-24),Math.min(h,horizontal?innerHeight-28:innerHeight-Math.max(r.top,12)-12))+'px';if(horizontal){panel.style.left=r.left+'px';panel.style.right='auto';panel.style.top='auto';panel.style.bottom='16px';}else clampPlayer(Math.min(r.left,innerWidth-parseFloat(panel.style.width)-12),Math.min(r.top,innerHeight-parseFloat(panel.style.height)-12));document.body.style.paddingBottom=horizontal?(parseFloat(panel.style.height)+32)+'px':'';}
 resize.addEventListener('pointerdown',e=>{if(e.button!==0)return;const r=panel.getBoundingClientRect();resizing={x:e.clientX,y:e.clientY,w:r.width,h:r.height,horizontal:panel.classList.contains('is-horizontal')};resize.setPointerCapture(e.pointerId);e.preventDefault();});
 resize.addEventListener('pointermove',e=>{if(resizing)size(resizing.w+e.clientX-resizing.x,resizing.h+(resizing.horizontal?-1:1)*(e.clientY-resizing.y));});
 for(const name of ['pointerup','pointercancel'])resize.addEventListener(name,()=>resizing=null);
 resize.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const r=panel.getBoundingClientRect();const step=e.shiftKey?10:30;size(r.width+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),r.height+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0));});
 const sizingObserver=new ResizeObserver(entries=>{const width=entries[0].contentRect.width;panel.classList.toggle('is-narrow',width<760);panel.classList.toggle('is-tiny',width<376);});sizingObserver.observe(panel);
 panel.querySelectorAll('.horizontal-player,.compact-player').forEach(button=>button.addEventListener('click',()=>{panel.style.width='';panel.style.height='';document.body.style.paddingBottom='';}));
 const minimize=panel.querySelector('.minimize-player');let expandedSize=null;minimize.addEventListener('click',()=>{if(panel.classList.contains('is-minimized')){expandedSize={width:panel.style.width,height:panel.style.height};panel.style.width='';panel.style.height='';document.body.style.paddingBottom='';}else if(expandedSize){panel.style.width=expandedSize.width;panel.style.height=expandedSize.height;}});
 const release=window.latestRelease;
 if(!release)return;
 let existing=catalog.find(t=>t.id===release.id);
 if(!existing){catalog.unshift({...release});artwork[release.id]={artwork:release.artwork||'assets/chicken-balls-logo-purple.svg',missing:!release.artwork};render();document.getElementById('total-count').textContent=`${catalog.length} TRACKS / THE ARCHIVE`;}else {existing.releaseDate=release.releaseDate;if(release.audio)existing.audio=release.audio;}
 const date=release.releaseDate?new Date(release.releaseDate.slice(0,10)+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'Date to be confirmed';
 document.getElementById('latest-release').innerHTML=`<button class="latest-cover" data-play="${escapeHTML(release.id)}" aria-label="Play ${escapeHTML(release.title)}"><img src="${escapeHTML(release.artwork||artwork[release.id]?.artwork||'assets/chicken-balls-logo-purple.svg')}" alt="Cover artwork for ${escapeHTML(release.title)}"><span class="release-play">▶ PLAY THE RELEASE</span></button><div class="latest-copy"><span class="eyebrow">${escapeHTML(release.artist)}</span><h3>${escapeHTML(release.title)}</h3><dl class="release-details"><div><dt>RELEASED</dt><dd>${escapeHTML(date)}</dd></div><div><dt>GENRE</dt><dd>${escapeHTML(release.genre||'Electronic / genre to be confirmed')}</dd></div></dl><p>${escapeHTML(release.description||'A new chapter in the Chicken Balls catalog. Press play and explore the release.')}</p>${release.feeling?`<p><strong>FEELING</strong> ${escapeHTML(release.feeling)}</p>`:''}<span class="release-note">${escapeHTML(release.descriptionSource||'Release notes')}</span></div>`;
 const info=panel.querySelector('.now-playing'),title=document.getElementById('playing-title');
 const canvas=document.createElement('canvas');canvas.className='player-visualizer';canvas.setAttribute('aria-label','Live audio spectrum');
 const caption=document.createElement('span');caption.className='visualizer-caption sr-only';caption.setAttribute('role','status');
 const spectrum=document.createElement('div');spectrum.className='player-spectrum';spectrum.append(canvas,caption);panel.append(spectrum);info.append(panel.querySelector('.player-transport'));
 const ctx=canvas.getContext('2d');
 function fitSpectrum(){canvas.style.width='100%';}
 const spectrumSizeObserver=new ResizeObserver(fitSpectrum);spectrumSizeObserver.observe(spectrum);document.fonts.ready.then(fitSpectrum);
 window.addEventListener('trackchange',()=>requestAnimationFrame(fitSpectrum));
 let context,analyser,audio,data;const wired=new WeakMap();
 function connect(){const element=playerScreen.querySelector('audio');audio=element;if(!element){analyser=null;caption.textContent='Live spectrum is available for saved audio; streaming playback uses the embedded player.';return;}if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){caption.textContent='Live spectrum is unavailable in this browser.';return;}context=new Audio();}if(wired.has(element)){analyser=wired.get(element);}else{analyser=context.createAnalyser();analyser.fftSize=2048;analyser.minDecibels=-90;analyser.maxDecibels=-18;analyser.smoothingTimeConstant=.65;const source=context.createMediaElementSource(element);source.connect(analyser);analyser.connect(context.destination);wired.set(element,analyser);}data=new Uint8Array(analyser.frequencyBinCount);caption.textContent='Live spectrum · '+currentTrack.title;if(!element.paused)context.resume().catch(()=>{});}
 window.addEventListener('trackchange',connect);panel.addEventListener('play',()=>{if(!audio||audio!==playerScreen.querySelector('audio'))connect();context?.resume().catch(()=>{});},true);
 const levels=new Float32Array(28);
 function spectrumLevels(){
  const result=new Float32Array(28);if(!analyser||!data||!audio||audio.paused)return result;
  analyser.getByteFrequencyData(data);
  // Logarithmic bands use the musical range instead of sampling the almost
  // silent bins near Nyquist. Every column combines a full frequency band.
  const binHz=context.sampleRate/analyser.fftSize,low=45,high=Math.min(8000,context.sampleRate*.4);
  for(let i=0;i<28;i++){const lo=Math.max(1,Math.floor(low*Math.pow(high/low,i/28)/binHz)),hi=Math.min(data.length,Math.max(lo+1,Math.ceil(low*Math.pow(high/low,(i+1)/28)/binHz)));let peak=0,sum=0;for(let j=lo;j<hi;j++){peak=Math.max(peak,data[j]);sum+=data[j];}const average=sum/Math.max(1,hi-lo);result[i]=Math.min(1,(peak*.7+average*.3)/255);}
  return result;
 }
 function draw(){
  if(!panel.classList.contains('is-minimized')){
   const rect=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2),w=Math.round(rect.width*ratio),h=Math.round(rect.height*ratio);
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   ctx.clearRect(0,0,w,h);const target=spectrumLevels(),bars=28,gap=2*ratio,bw=Math.max(1,(w-gap*(bars-1))/bars);ctx.fillStyle='#bcff35';
   for(let i=0;i<bars;i++){levels[i]+=(target[i]-levels[i])*.35;const bh=Math.max(3*ratio,Math.round(levels[i]*(h-4*ratio)/(3*ratio))*3*ratio);ctx.beginPath();ctx.roundRect(i*(bw+gap),h-bh,bw,bh,[ratio,2*ratio,ratio,2*ratio]);ctx.fill();}
   canvas.dataset.lastBands=Array.from(levels.slice(-4)).map(v=>v.toFixed(3)).join(',');
  }requestAnimationFrame(draw);
 }
 connect();fitSpectrum();draw();
})();
