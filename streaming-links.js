(() => {
 const extraIcons={
  youtubeMusic:'<path d="M6 2h12v3h3v14h-3v3H6v-3H3V5h3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 7h3v3h4v4h-4v3H9z"/>',
  appleMusic:'<path d="M9 4h12v13h-3v3h-5v-5h5V8h-6v11H9v3H4v-5h5z"/>',
  deezer:'<path d="M2 18h4v3H2zm0-5h4v3H2zm5 5h4v3H7zm0-5h4v3H7zm0-5h4v3H7zm5 10h4v3h-4zm0-5h4v3h-4zm5 5h4v3h-4zm0-5h4v3h-4zm0-5h4v3h-4zm0-5h4v3h-4z"/>',
  amazonMusic:'<path d="M6 3h12v12h-3v3h-4v-5h4V7H9v11H6v3H2v-5h4zM12 20h7v-2h3v5H12z"/>',
  tidal:'<path d="M2 6h3V3h3v3h3v3H8v3H5V9H2zm10 0h3V3h3v3h3v3h-3v3h-3V9h-3zM7 16h3v-3h3v3h3v3h-3v3h-3v-3H7z"/>',
  bandcamp:'<path d="M8 5h14v4h-3v5h-3v5H2v-4h3v-5h3z"/>'
 };
 const platforms=[['youtube','YouTube'],['spotify','Spotify'],['appleMusic','Apple Music'],['youtubeMusic','YouTube Music'],['deezer','Deezer'],['soundcloud','SoundCloud'],['amazonMusic','Amazon Music'],['tidal','TIDAL'],['bandcamp','Bandcamp']];
 function destination(track,key){
  const saved=track.streamingLinks?.[key];if(saved&&/^https:\/\//.test(saved))return {url:saved,direct:true};
  if(key==='youtube'&&track.youtube)return {url:'https://www.youtube.com/watch?v='+encodeURIComponent(track.youtube),direct:true};
  if(key==='youtubeMusic'&&track.youtube)return {url:'https://music.youtube.com/watch?v='+encodeURIComponent(track.youtube),direct:true};
  if(key==='spotify'&&track.spotify)return {url:'https://open.spotify.com/'+(track.spotifyKind==='album'?'album':'track')+'/'+encodeURIComponent(track.spotify),direct:true};
  if(key==='soundcloud'&&track.soundcloud)return {url:track.soundcloud,direct:true};
  const term=encodeURIComponent(track.artist+' '+track.title);
  const search={youtube:'https://www.youtube.com/results?search_query='+term,youtubeMusic:'https://music.youtube.com/search?q='+term,spotify:'https://open.spotify.com/search/'+term,appleMusic:'https://music.apple.com/us/search?term='+term,deezer:'https://www.deezer.com/search/'+term+'/track',soundcloud:'https://soundcloud.com/search/sounds?q='+term,amazonMusic:'https://music.amazon.com/search/'+term,tidal:'https://listen.tidal.com/search?q='+term,bandcamp:'https://bandcamp.com/search?q='+term};
  return {url:search[key],direct:false};
 }
 function links(track,compact){
  const group=document.createElement('div');group.className='streaming-links'+(compact?' player-streaming-links':'');group.setAttribute('role','group');group.setAttribute('aria-label','Streaming platforms for '+track.title);
  for(const [key,label] of platforms){
   const target=destination(track,key),link=document.createElement('a');link.className='platform-link';link.href=target.url;link.target='_blank';link.rel='noopener';link.dataset.platform=key;link.dataset.destination=target.direct?'track':'search';
   const action=target.direct?'Listen to '+track.title+' on '+label:'Search for '+track.title+' by '+track.artist+' on '+label;link.setAttribute('aria-label',action);link.title=action;
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.innerHTML=playerIcons[key]||extraIcons[key];link.append(svg);
   const text=document.createElement('span');text.className=compact?'sr-only':'platform-name';text.textContent=(target.direct?'':'Find on ')+label;link.append(text);
   if(!target.direct){const badge=document.createElement('span');badge.className='platform-search-mark';badge.setAttribute('aria-hidden','true');badge.textContent='↗';link.append(badge);}
   group.append(link);
  }
  return group;
 }
 function updatePlayerLinks(){
  const actions=document.querySelector('.player-actions');actions.querySelector('.player-streaming-links')?.remove();actions.append(links(currentTrack,true));
 }
 const release=window.latestRelease;if(release){const copy=document.querySelector('#latest-release .latest-copy'),note=copy?.querySelector('.release-note');const track={...catalog.find(t=>t.id===release.id),...release};if(copy)copy.insertBefore(links(track,false),note||null);}
 window.addEventListener('trackchange',updatePlayerLinks);updatePlayerLinks();
})();

