const musicPanel=document.getElementById('listening-room');
const playerIcons={
 play:'<path d="M7 4h4v3h4v3h4v4h-4v3h-4v3H7z"/>',pause:'<path d="M5 4h5v16H5zm9 0h5v16h-5z"/>',prev:'<path d="M4 5h3v14H4zm15 0v14h-4v-3h-4v-3H8v-2h3V8h4V5z"/>',next:'<path d="M17 5h3v14h-3zM5 5h4v3h4v3h3v2h-3v3H9v3H5z"/>',shuffle:'<path d="M3 6h5l8 12h4m-4-4 4 4-4 4M3 18h5L16 6h4m-4-4 4 4-4 4" fill="none" stroke="currentColor" stroke-width="2"/>',horizontal:'<path d="M3 6h18v12H3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 9h4v6H6zm7 0h5v2h-5zm0 4h5v2h-5z"/>',autoplay:'<path d="M3 3h18v4h-3V6H6v3H3zm18 9v9H3v-4h3v1h12v-6zM9 8h3v2h3v4h-3v2H9z"/>',repeat:'<path d="M5 7h14l-4-4m4 4-4 4M19 17H5l4 4m-4-4 4-4" fill="none" stroke="currentColor" stroke-width="2"/>',minimize:'<path d="M4 15h16v3H4z"/>',expand:'<path d="M4 4h7v3H7v4H4zm9 0h7v7h-3V7h-4zM4 13h3v4h4v3H4zm13 0h3v7h-7v-3h4z"/>',drag:'<path d="M5 5h4v4H5zm10 0h4v4h-4zM5 15h4v4H5zm10 0h4v4h-4z"/>',youtube:'<path d="M3 5h18v14H3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m9 8 7 4-7 4z"/>',audio:'<path d="M3 10h3v4H3zm5-4h3v12H8zm5-3h3v18h-3zm5 5h3v8h-3z"/>',soundcloud:'<path d="M3 13h2v5H3zm4-4h2v9H7zm4 2a5 5 0 0 1 10 0v7H11z"/>',spotify:'<path d="M4 7q8-4 16 0M5 12q7-3 14 0M7 17q5-2 10 0" fill="none" stroke="currentColor" stroke-width="2"/>',external:'<path d="M13 3h8v8m0-8L10 14M9 5H3v16h16v-6" fill="none" stroke="currentColor" stroke-width="2"/>'
};
function playerIcon(name){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+playerIcons[name]+'</svg>';}
function iconButton(className,name,label,pressed){return '<button class="'+className+'" aria-label="'+label+'" title="'+label+'"'+(pressed===undefined?'':' aria-pressed="'+pressed+'"')+'>'+playerIcon(name)+'</button>';}
const toolbar=document.createElement('div');toolbar.className='player-toolbar';toolbar.innerHTML=iconButton('player-grip','drag','Move player. Drag or use arrow keys.')+'<span class="minimized-title"></span>'+'<div class="player-view-buttons">'+iconButton('horizontal-player','horizontal','Horizontal player')+iconButton('compact-player','expand','Draggable player')+iconButton('minimize-player','minimize','Minimize player')+'</div>';musicPanel.prepend(toolbar);
const transport=document.createElement('div');transport.className='player-transport';transport.innerHTML='<div class="transport-main">'+iconButton('transport-prev','prev','Previous song')+iconButton('transport-play','play','Play current song')+iconButton('transport-next','next','Next song')+'</div><div class="queue-options">'+iconButton('shuffle-toggle','shuffle','Shuffle',false)+iconButton('autoplay-toggle','autoplay','Autoplay',true)+iconButton('repeat-toggle','repeat','Repeat: off',false)+'</div>';musicPanel.append(transport);
const playButton=transport.querySelector('.transport-play');
for(const [mode,button] of Object.entries(modeButtons)){button.innerHTML=playerIcon(mode);button.setAttribute('aria-label',mode.toUpperCase());button.title=mode==='audio'?'Saved archive audio':mode;}
const originalButton=document.getElementById('original-track');originalButton.innerHTML=playerIcon('external');originalButton.setAttribute('aria-label','Open original track');originalButton.title='Open original track';
let minimized=false,dragOffset=null,playerLayout='horizontal';
const minimizeButton=toolbar.querySelector('.minimize-player'),grip=toolbar.querySelector('.player-grip');
function clampPlayer(x,y){const r=musicPanel.getBoundingClientRect();musicPanel.style.left=Math.max(12,Math.min(x,innerWidth-r.width-12))+'px';musicPanel.style.top=Math.max(12,Math.min(y,innerHeight-r.height-12))+'px';musicPanel.style.right='auto';musicPanel.style.bottom='auto';}
minimizeButton.addEventListener('click',()=>{const r=musicPanel.getBoundingClientRect();minimized=!minimized;musicPanel.classList.toggle('is-minimized',minimized);minimizeButton.innerHTML=playerIcon(minimized?'expand':'minimize');minimizeButton.setAttribute('aria-label',minimized?'Expand player':'Minimize player');minimizeButton.title=minimized?'Expand player':'Minimize player';if(musicPanel.style.left)clampPlayer(r.x,r.y);});
function setPlayerLayout(layout){playerLayout=layout;minimized=false;musicPanel.classList.remove('is-minimized');musicPanel.classList.toggle('is-horizontal',layout==='horizontal');musicPanel.style.left='';musicPanel.style.top='';musicPanel.style.right='';musicPanel.style.bottom='';minimizeButton.innerHTML=playerIcon('minimize');minimizeButton.setAttribute('aria-label','Minimize player');toolbar.querySelector('.horizontal-player').setAttribute('aria-pressed',String(layout==='horizontal'));toolbar.querySelector('.compact-player').setAttribute('aria-pressed',String(layout==='compact'));}
toolbar.querySelector('.horizontal-player').addEventListener('click',()=>setPlayerLayout('horizontal'));
toolbar.querySelector('.compact-player').addEventListener('click',()=>setPlayerLayout('compact'));
setPlayerLayout('horizontal');
grip.addEventListener('pointerdown',e=>{if(playerLayout==='horizontal'||e.button!==0)return;const r=musicPanel.getBoundingClientRect();dragOffset={x:e.clientX-r.left,y:e.clientY-r.top};grip.setPointerCapture(e.pointerId);e.preventDefault();});
grip.addEventListener('pointermove',e=>{if(dragOffset)clampPlayer(e.clientX-dragOffset.x,e.clientY-dragOffset.y);});
grip.addEventListener('pointerup',()=>dragOffset=null);grip.addEventListener('pointercancel',()=>dragOffset=null);
grip.addEventListener('keydown',e=>{if(playerLayout==='horizontal'||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const r=musicPanel.getBoundingClientRect(),step=e.shiftKey?10:25;clampPlayer(r.x+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),r.y+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0));});
window.addEventListener('resize',()=>{if(musicPanel.style.left){const r=musicPanel.getBoundingClientRect();clampPlayer(r.x,r.y);}});
let shuffle=false,autoplay=true,repeatMode='off',shuffleBag=[],playedHistory=[],shuffleCycleStarted=false;
function keepPlayerFloating(){musicPanel.classList.add('is-floating');document.body.classList.add('has-floating-player');}
window.floatMusicPlayer=keepPlayerFloating;
function availableTracks(){const query=search.value.trim().toLocaleLowerCase();return catalog.filter(t=>(selectedArtist==='All'||t.artist===selectedArtist)&&(t.title+' '+t.artist).toLocaleLowerCase().includes(query));}
function nextTrackId(automatic=false){
 const tracks=availableTracks();if(!tracks.length)return null;
 if(shuffle){
  const eligible=tracks.filter(t=>t.id!==currentTrack.id).map(t=>t.id);
  shuffleBag=shuffleBag.filter(id=>eligible.includes(id));
  if(!shuffleBag.length){
   if(automatic&&shuffleCycleStarted&&repeatMode!=='all')return null;
   shuffleCycleStarted=true;shuffleBag=[...eligible];for(let i=shuffleBag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffleBag[i],shuffleBag[j]]=[shuffleBag[j],shuffleBag[i]];}
  }
  return shuffleBag.pop()||(automatic&&repeatMode!=='all'?null:tracks[0].id);
 }
 const index=tracks.findIndex(t=>t.id===currentTrack.id);
 if(automatic&&index===tracks.length-1&&repeatMode!=='all')return null;
 return tracks[(index+1)%tracks.length].id;
}
function advance(automatic=false){const id=nextTrackId(automatic);if(id){playedHistory.push(currentTrack.id);playTrack(id);}else playerStatus.textContent='End of this selection.';}
transport.querySelector('.transport-next').addEventListener('click',()=>advance());
transport.querySelector('.transport-prev').addEventListener('click',()=>{const tracks=availableTracks();if(!tracks.length)return;const previous=shuffle?playedHistory.pop():null;const index=tracks.findIndex(t=>t.id===currentTrack.id);playTrack(previous||tracks[(index-1+tracks.length)%tracks.length].id);});
transport.querySelector('.shuffle-toggle').addEventListener('click',e=>{shuffle=!shuffle;shuffleBag=[];shuffleCycleStarted=false;e.currentTarget.setAttribute('aria-pressed',String(shuffle));});
transport.querySelector('.autoplay-toggle').addEventListener('click',e=>{autoplay=!autoplay;e.currentTarget.setAttribute('aria-pressed',String(autoplay));});
transport.querySelector('.repeat-toggle').addEventListener('click',e=>{repeatMode=repeatMode==='off'?'all':repeatMode==='all'?'one':'off';e.currentTarget.innerHTML=playerIcon('repeat')+(repeatMode==='one'?'<span class="repeat-one">1</span>':'');e.currentTarget.title='Repeat: '+repeatMode;e.currentTarget.setAttribute('aria-label','Repeat: '+repeatMode);e.currentTarget.setAttribute('aria-pressed',String(repeatMode!=='off'));});
window.handleTrackEnded=()=>{if(repeatMode==='one')showPlayer(playerMode,true);else if(autoplay)advance(true);else syncTransport();};
playButton.addEventListener('click',()=>{const audio=playerScreen.querySelector('audio');if(audio){if(audio.paused)audio.play().catch(()=>playerStatus.textContent='Press play in the audio player.');else audio.pause();}else if(playerMode==='youtube'&&youtubeReady){if(youtubePlayer.getPlayerState()===1)youtubePlayer.pauseVideo();else youtubePlayer.playVideo();}else if(playerMode==='youtube'){requestedPlayback=true;playerStatus.textContent='Loading the player…';}else if(playerMode==='soundcloud'&&window.soundcloudWidget)window.soundcloudWidget.toggle();else{playerScreen.querySelector('iframe')?.focus();playerStatus.textContent='Use the play button inside the player.';}syncTransport();});
function syncTransport(){
 toolbar.querySelector('.minimized-title').textContent=currentTrack.title;
 const limited=playerMode==='spotify';transport.querySelectorAll('.autoplay-toggle,.repeat-toggle').forEach(b=>{b.disabled=limited;b.title=limited?'Spotify controls playback inside its embedded player.':'';});
 if(limited){playButton.innerHTML=playerIcon('play');playButton.setAttribute('aria-label','Use Spotify player controls');return;}
 if(playerMode==='soundcloud'&&window.soundcloudWidget){const widget=window.soundcloudWidget;widget.isPaused(paused=>{if(widget===window.soundcloudWidget)setPlayLabel(!paused);});return;}
 const audio=playerScreen.querySelector('audio');setPlayLabel(audio?!audio.paused:playerMode==='youtube'&&youtubeReady&&youtubePlayer?.getPlayerState()===1);
}
function setPlayLabel(playing){playButton.innerHTML=playerIcon(playing?'pause':'play');playButton.title=playing?'Pause current song':'Play current song';playButton.setAttribute('aria-label',playing?'Pause current song':'Play current song');}
window.syncPlayerTransport=syncTransport;musicPanel.addEventListener('play',syncTransport,true);musicPanel.addEventListener('pause',syncTransport,true);musicPanel.addEventListener('ended',syncTransport,true);new MutationObserver(syncTransport).observe(playerStatus,{childList:true,characterData:true,subtree:true});
search.addEventListener('input',()=>{shuffleBag=[];shuffleCycleStarted=false;});document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{shuffleBag=[];shuffleCycleStarted=false;}));
keepPlayerFloating();syncTransport();
