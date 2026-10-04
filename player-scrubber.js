(() => {
 const panel=document.getElementById('listening-room');
 const controls=document.createElement('div');controls.className='player-seek';controls.hidden=true;
 controls.innerHTML='<span class="seek-time seek-elapsed">0:00</span><input class="seek-range" type="range" min="0" max="0" step="0.1" value="0" aria-label="Seek through current track" disabled><span class="seek-time seek-duration">0:00</span><button class="seek-mute" type="button" aria-label="Mute audio" title="Mute audio"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4V6h4V3h3v18h-3v-3H7v-3H3zM17 7h3v3h2v4h-2v3h-3v-3h2v-4h-2z"/></svg></button><a class="seek-download" aria-label="Download current audio" title="Download audio" download><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2h4v9h4v3h-3v3H9v-3H6v-3h4zM3 18h4v2h10v-2h4v5H3z"/></svg></a>';
 panel.append(controls);
 const range=controls.querySelector('.seek-range'),elapsed=controls.querySelector('.seek-elapsed'),duration=controls.querySelector('.seek-duration'),mute=controls.querySelector('.seek-mute'),download=controls.querySelector('.seek-download');
 let audio=null,events=null,scrubbing=false;
 const clock=seconds=>{const n=Math.max(0,Math.floor(seconds||0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');};
 function update(){
  if(!audio)return;
  const valid=Number.isFinite(audio.duration)&&audio.duration>0;
  range.disabled=!valid;range.max=valid?audio.duration:0;
  if(!scrubbing)range.value=valid?audio.currentTime:0;
  elapsed.textContent=clock(Number(range.value));duration.textContent=valid?clock(audio.duration):'—:—';
  range.style.setProperty('--seek-progress',valid?(Number(range.value)/audio.duration*100)+'%':'0%');
  range.setAttribute('aria-valuetext',clock(Number(range.value))+' of '+(valid?clock(audio.duration):'loading'));
  mute.setAttribute('aria-label',audio.muted?'Unmute audio':'Mute audio');mute.title=audio.muted?'Unmute audio':'Mute audio';mute.setAttribute('aria-pressed',String(audio.muted));
 }
 function bind(){
  events?.abort();events=new AbortController();scrubbing=false;audio=playerScreen.querySelector('audio');controls.hidden=!audio;panel.classList.toggle('has-archive-audio',Boolean(audio));
  if(!audio)return;
  download.href=currentTrack.audio;download.download=currentTrack.originalFilename||currentTrack.title+'.mp3';
  for(const event of ['loadedmetadata','durationchange','timeupdate','emptied','volumechange'])audio.addEventListener(event,update,{signal:events.signal});
  update();
 }
 range.addEventListener('pointerdown',()=>scrubbing=true);
 range.addEventListener('input',()=>{if(!audio||range.disabled)return;audio.currentTime=Number(range.value);update();});
 for(const event of ['change','pointerup','pointercancel','blur'])range.addEventListener(event,()=>{scrubbing=false;update();});
 mute.addEventListener('click',()=>{if(audio){audio.muted=!audio.muted;update();}});
 window.addEventListener('trackchange',bind);bind();
})();
