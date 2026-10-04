(() => {
 const verifiedDestinations={"WrjCeMjexWc": {"appleMusic": "https://music.apple.com/us/album/waverider/1500466022?i=1500466023&uo=4"}, "0jZfu7AWHM0": {"appleMusic": "https://music.apple.com/us/album/hotwire/1698509712?i=1698509715&uo=4"}, "3yLBYcHJ2VY": {"appleMusic": "https://music.apple.com/us/album/concentrated-madness/1519691406?i=1519691407&uo=4"}, "IDB6aJWg4lg": {"appleMusic": "https://music.apple.com/us/album/guesswork/1457449419?i=1457449420&uo=4"}, "dG6aKvJk3sM": {"appleMusic": "https://music.apple.com/us/album/vernyi/1621539544?i=1621539545&uo=4"}, "d7FTtwyaIcI": {"appleMusic": "https://music.apple.com/us/album/speedrun/1591400901?i=1591400902&uo=4"}, "FPeV7PODP1s": {"appleMusic": "https://music.apple.com/us/album/zoology/1437852738?i=1437852751&uo=4"}, "ATNTVVZCWkU": {"appleMusic": "https://music.apple.com/us/album/flesh/1542545741?i=1542545742&uo=4"}, "X5Rpm8JVQBg": {"appleMusic": "https://music.apple.com/us/album/zircon/1448618026?i=1448618027&uo=4"}, "ZCJ1nJ3Q79E": {"appleMusic": "https://music.apple.com/us/album/framework/1663900487?i=1663900488&uo=4"}, "hL2ZWAv0278": {"appleMusic": "https://music.apple.com/us/album/touchstone/1437694439?i=1437694442&uo=4"}, "BstitX2x7vM": {"appleMusic": "https://music.apple.com/us/album/pseudoscience/1447895947?i=1447895950&uo=4"}, "KRCBjxM92Uk": {"appleMusic": "https://music.apple.com/us/album/omnipotence/1488831034?i=1488831035&uo=4"}, "5OS3_Y8_raw": {"appleMusic": "https://music.apple.com/us/album/nanowire/1698509712?i=1698510076&uo=4"}, "JpVo3seANv0": {"appleMusic": "https://music.apple.com/us/album/kinship/1695575385?i=1695575626&uo=4"}, "XP1oxENYnQ4": {"appleMusic": "https://music.apple.com/us/album/disco-mbobulate/1696443364?i=1696443366&uo=4"}, "s4lCTG9Pzq4": {"appleMusic": "https://music.apple.com/us/album/trapwire/1698509712?i=1698509713&uo=4"}, "Remok-ADVHM": {"appleMusic": "https://music.apple.com/us/album/ascendant-decade/1501971778?i=1501971779&uo=4"}, "V0oW0gPL5vo": {"appleMusic": "https://music.apple.com/us/album/glazed-curd/1561027896?i=1561027897&uo=4"}, "6UAUJfoGDfI": {"appleMusic": "https://music.apple.com/us/album/bones/1542545741?i=1542545743&uo=4"}};
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
  const saved=track.streamingLinks?.[key]||verifiedDestinations[track.id]?.[key];if(saved&&/^https:\/\//.test(saved))return {url:saved,direct:true};
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

