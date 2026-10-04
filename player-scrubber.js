(() => {
 const panel=document.getElementById('listening-room');
 const controls=document.createElement('div');controls.className='player-seek';controls.hidden=true;
 controls.innerHTML='<span class="seek-time seek-elapsed">0:00</span><input class="seek-range" type="range" min="0" max="0" step="0.1" value="0" aria-label="Seek through current track" disabled><span class="seek-time seek-duration">0:00</span><button class="seek-mute" type="button" aria-label="Mute audio" title="Mute audio"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4V6h4V3h3v18h-3v-3H7v-3H3zM17 7h3v3h2v4h-2v3h-3v-3h2v-4h-2z"/></svg></button><a class="seek-download" aria-label="Download current audio" title="Download audio" download><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2h4v9h4v3h-3v3H9v-3H6v-3h4zM3 18h4v2h10v-2h4v5H3z"/></svg></a>';
 panel.append(controls);
 const range=controls.querySelector('.seek-range'),elapsed=controls.querySelector('.seek-elapsed'),duration=controls.querySelector('.seek-duration'),mute=controls.querySelector('.seek-mute'),download=controls.querySelector('.seek-download');
 const volume=document.createElement('input');volume.className='volume-range';volume.type='range';volume.min='0';volume.max='1';volume.step='0.01';volume.value='1';volume.setAttribute('aria-label','Volume');volume.title='Volume';mute.after(volume);
 let audio=null,events=null,scrubbing=false,savedVolume=1,savedMuted=false,lastAudibleVolume=1;
 try{const preference=JSON.parse(localStorage.getItem('chicken-balls-volume'));if(preference&&Number.isFinite(preference.volume)){savedVolume=Math.max(0,Math.min(1,preference.volume));savedMuted=Boolean(preference.muted);lastAudibleVolume=savedVolume||1;}}catch{}
 function rememberVolume(){if(!audio)return;savedVolume=audio.volume;savedMuted=audio.muted;if(savedVolume>0)lastAudibleVolume=savedVolume;try{localStorage.setItem('chicken-balls-volume',JSON.stringify({volume:savedVolume,muted:savedMuted}));}catch{}update();}
 const clock=seconds=>{const n=Math.max(0,Math.floor(seconds||0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');};
 function update(){
  if(!audio)return;
  const valid=Number.isFinite(audio.duration)&&audio.duration>0;
  range.disabled=!valid;range.max=valid?audio.duration:0;
  if(!scrubbing)range.value=valid?audio.currentTime:0;
  elapsed.textContent=clock(Number(range.value));duration.textContent=valid?clock(audio.duration):'—:—';
  range.style.setProperty('--seek-progress',valid?(Number(range.value)/audio.duration*100)+'%':'0%');
  range.setAttribute('aria-valuetext',clock(Number(range.value))+' of '+(valid?clock(audio.duration):'loading'));
  const silent=audio.muted||audio.volume===0;
  mute.setAttribute('aria-label',silent?'Unmute audio':'Mute audio');mute.title=silent?'Unmute audio':'Mute audio';mute.setAttribute('aria-pressed',String(silent));
  volume.value=audio.muted?'0':String(audio.volume);const percent=Math.round(Number(volume.value)*100);volume.setAttribute('aria-valuetext',percent+'%');volume.title='Volume: '+percent+'%';volume.style.setProperty('--volume-progress',percent+'%');
 }
 function bind(){
  events?.abort();events=new AbortController();scrubbing=false;audio=playerScreen.querySelector('audio');controls.hidden=!audio;panel.classList.toggle('has-archive-audio',Boolean(audio));
  if(!audio)return;
  audio.volume=savedVolume;audio.muted=savedMuted;
  download.href=currentTrack.audio;download.download=currentTrack.originalFilename||currentTrack.title+'.mp3';
  for(const event of ['loadedmetadata','durationchange','timeupdate','emptied'])audio.addEventListener(event,update,{signal:events.signal});
  audio.addEventListener('volumechange',rememberVolume,{signal:events.signal});
  update();
 }
 range.addEventListener('pointerdown',()=>scrubbing=true);
 range.addEventListener('input',()=>{if(!audio||range.disabled)return;audio.currentTime=Number(range.value);update();});
 for(const event of ['change','pointerup','pointercancel','blur'])range.addEventListener(event,()=>{scrubbing=false;update();});
 volume.addEventListener('input',()=>{if(audio){audio.volume=Number(volume.value);audio.muted=false;rememberVolume();}});
 mute.addEventListener('click',()=>{if(audio){if(audio.muted||audio.volume===0){audio.muted=false;if(audio.volume===0)audio.volume=lastAudibleVolume;}else audio.muted=true;rememberVolume();}});
 window.addEventListener('trackchange',bind);bind();
})();

