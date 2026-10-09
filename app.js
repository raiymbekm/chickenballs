let selectedArtist='All';
let isDiscography,releaseFilter,lengthFilter,sortControl,list,search,more;
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function trackCard(t,i){
 const cover=artwork[t.id]||{artwork:'assets/chicken-balls-logo-purple.svg',missing:true};
 const date=catalogTools.date(t),duration=catalogTools.seconds(t);
 const releaseLabel=t.releaseStatus==='official'?'Released':t.releaseStatus==='unofficial'?'Unreleased':'Release unverified';
 const dateLabel=date?new Date(date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Date unconfirmed';
 const lengthLabel=duration===null?'Length unconfirmed':duration<90?'Short / WIP':'Full length';
 const link=(url,label)=>platformAnchor(url,label,t.title);
 return `<article class="track" data-track="${t.id}"><div class="track-name"><span class="track-number">${String(i+1).padStart(2,'0')}</span><button class="art-play" data-play="${t.id}" aria-label="Play ${escapeHTML(t.title)}"><img src="${cover.artwork}" alt="${cover.missing?'Cover not on file':`Artwork for ${escapeHTML(t.title)}`}" loading="lazy" width="80" height="80"><span aria-hidden="true">▶</span></button><div><h4>${escapeHTML(t.title)}</h4><p>${escapeHTML(t.credit||t.artist)}</p><div class="copy-badge">${t.audio?'ARCHIVE COPY':'PLATFORM EMBED'}</div></div></div><span class="track-type"><span class="track-release-status">${releaseLabel}</span><span class="track-date">${dateLabel}</span><span class="track-length">${lengthLabel} · ${t.duration||'—'}</span></span><div class="track-links"><span class="duration">${t.duration||''}</span><button class="track-play" data-play="${t.id}" aria-label="Listen to ${escapeHTML(t.title)}">PLAY</button>${t.releaseStatus==='official'&&t.spotify?link(`https://open.spotify.com/${t.spotifyKind==='album'?'album':'track'}/${t.spotify}`,'Spotify'):''}${t.youtube?link(`https://www.youtube.com/watch?v=${t.youtube}`,'YouTube'):''}${t.soundcloud?link(t.soundcloud,'SoundCloud'):''}${t.releaseStatus==='official'&&t.streamingLinks?.appleMusic?link(t.streamingLinks.appleMusic,'Apple Music'):''}${t.audio?`<a class="catalog-platform" href="${t.audio}" download="${escapeHTML(t.originalFilename||t.title+'.mp3')}" title="Download audio" aria-label="Download ${escapeHTML(t.title)}">${window.platformIcon('download')}</a>`:''}</div></article>`;
}
function getFilteredTracks(){
 const source=isDiscography?catalog:catalog.filter(track=>track.releaseStatus==='official');
 return catalogTools.sort(catalogTools.filter(source,{artist:selectedArtist,query:search.value,status:releaseFilter?.value||'all',length:lengthFilter?.value||'all'}),sortControl?.value||'newest');
}
function render(){
 const found=getFilteredTracks(),displayed=isDiscography?found:found.slice(0,12);
 const seen=new Set(),cards=[];
 displayed.forEach((track,i)=>{
  const release=list.classList.contains('artwork-grid')&&window.releaseGroups.find(group=>group.tracks.includes(track.id));
  if(release&&seen.has(release.id))return;if(release)seen.add(release.id);cards.push({track,release,index:i});
 });
 const order=sortControl?.value;
 if(order==='name-asc'||order==='name-desc'||order==='artist-asc')cards.sort((a,b)=>{
  const artist=order==='artist-asc'?a.track.artist.localeCompare(b.track.artist):0;
  return artist||(a.release?.title||a.track.title).localeCompare(b.release?.title||b.track.title,'en',{numeric:true,sensitivity:'base'})*(order==='name-desc'?-1:1);
 });
 list.innerHTML=cards.map(({track,release,index})=>release?releaseCard(release):trackCard(track,index)).join('');
 if(more)more.hidden=false;
 document.getElementById('results-status').textContent=found.length?(isDiscography?`${found.length} ${found.length===1?'track':'tracks'}`:`${displayed.length} latest released tracks`):'No tracks found. Try another title or filter.';
 document.getElementById('total-count').textContent=isDiscography?`${catalog.length} TRACKS / EVERY CHAPTER`:'TWELVE OF OUR LATEST RELEASES';
}
function chooseFilter(artist){selectedArtist=artist;document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===artist;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});render();}
function mountCatalog(){
 isDiscography=document.body.dataset.page==='discography';selectedArtist='All';
 releaseFilter=document.getElementById('release-filter');lengthFilter=document.getElementById('length-filter');sortControl=document.getElementById('sort-tracks');
 list=document.getElementById('tracks');search=document.getElementById('search');more=document.getElementById('more');
 document.querySelector('.catalog-views')?.remove();
document.querySelectorAll('[data-filter]').forEach(button=>{
 if(!isDiscography&&button.dataset.filter!=='All'&&!catalog.some(track=>track.artist===button.dataset.filter&&track.releaseStatus==='official'))button.hidden=true;
 if(!isDiscography&&button.dataset.filter==='All')button.textContent='ALL RELEASES';
 button.addEventListener('click',()=>chooseFilter(button.dataset.filter));
});
search.addEventListener('input',render);
[releaseFilter,lengthFilter,sortControl].filter(Boolean).forEach(control=>control.addEventListener('change',render));
document.getElementById('reset-filters')?.addEventListener('click',()=>{search.value='';releaseFilter.value='all';lengthFilter.value='all';sortControl.value='newest';chooseFilter('All');});
document.getElementById('year').textContent=new Date().getFullYear();
const viewControls=document.createElement('div');viewControls.className='catalog-views';viewControls.setAttribute('role','group');viewControls.setAttribute('aria-label','Catalog display');viewControls.innerHTML='<button data-view="artwork" class="active" aria-pressed="true">ARTWORK</button><button data-view="list" aria-pressed="false">TRACK LIST</button>';document.querySelector('.archive-heading').after(viewControls);list.classList.add('artwork-grid');document.querySelector('.list-header').hidden=true;
viewControls.addEventListener('click',event=>{const button=event.target.closest('[data-view]');if(!button)return;const grid=button.dataset.view==='artwork';list.classList.toggle('artwork-grid',grid);document.querySelector('.list-header').hidden=grid;viewControls.querySelectorAll('button').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});render();});
render();

}
window.mountCatalog=mountCatalog;mountCatalog();

function platformAnchor(url,label,title){
 const key=({Spotify:'spotify',YouTube:'youtube',SoundCloud:'soundcloud','Apple Music':'appleMusic',Download:'download'})[label]||'download';
 return `<a class="catalog-platform" href="${escapeHTML(url)}" target="_blank" rel="noopener" aria-label="${escapeHTML(title)} on ${label}" title="${label}">${window.platformIcon(key)}<span class="sr-only">${label}</span></a>`;
}
function releaseCard(release){
 const first=catalog.find(t=>t.id===release.tracks[0]),cover=artwork[first.id];
 const date=new Date(release.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
 return `<article class="track release-card" data-release="${release.id}"><div class="track-name"><button class="art-play" data-release-open="${release.id}" aria-label="Open ${escapeHTML(release.title)} track list"><img src="${cover.artwork}" alt="Artwork for ${escapeHTML(release.title)}" loading="lazy" width="300" height="300"><span aria-hidden="true">${release.tracks.length} TRACKS</span></button><div><h4>${escapeHTML(release.title)}</h4><p>${escapeHTML(release.artist)}</p><div class="copy-badge">EP · ${release.tracks.length} TRACKS</div></div></div><span class="track-type"><span class="track-release-status">Released ${date}</span><span>${escapeHTML(release.genre)}</span></span><div class="track-links"><button class="release-open" data-release-open="${release.id}">VIEW TRACKS</button>${platformAnchor(release.appleMusic,'Apple Music',release.title)}</div></article>`;
}
function openRelease(id){
 const release=window.releaseGroups.find(group=>group.id===id);if(!release)return;
 document.getElementById('release-dialog')?.remove();
 const tracks=release.tracks.map(id=>catalog.find(t=>t.id===id)),cover=artwork[tracks[0].id];
 const total=tracks.reduce((sum,t)=>sum+(catalogTools.seconds(t)||0),0),date=new Date(release.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
 const dialog=document.createElement('dialog');dialog.id='release-dialog';dialog.className='release-dialog';dialog.setAttribute('aria-labelledby','release-dialog-title');
 dialog.innerHTML=`<button class="release-dialog-close" aria-label="Close release details" autofocus>×</button><div class="release-dialog-heading"><img src="${cover.artwork}" alt="Artwork for ${escapeHTML(release.title)}" width="150" height="150"><div><span class="eyebrow">EP · ${tracks.length} TRACKS</span><h2 id="release-dialog-title">${escapeHTML(release.title)}</h2><p>${escapeHTML(release.artist)}</p><p>${date} · ${escapeHTML(release.genre)} · ${Math.floor(total/60)}:${String(Math.round(total%60)).padStart(2,'0')}</p></div></div><ol class="release-song-list">${tracks.map(t=>`<li data-track="${t.id}"><button class="release-song-play" data-play="${t.id}" aria-label="Play ${escapeHTML(t.title)}">${playerIcon('play')}</button><div><h3>${escapeHTML(t.title)}</h3><p>${escapeHTML(t.credit||t.artist)} · ${t.duration||'—'}</p></div><div class="release-song-links">${t.youtube?platformAnchor('https://www.youtube.com/watch?v='+t.youtube,'YouTube',t.title):''}${t.streamingLinks?.spotify?platformAnchor(t.streamingLinks.spotify,'Spotify',t.title):''}${t.streamingLinks?.appleMusic?platformAnchor(t.streamingLinks.appleMusic,'Apple Music',t.title):''}${t.soundcloud?platformAnchor(t.soundcloud,'SoundCloud',t.title):''}${t.audio?`<a class="catalog-platform" href="${escapeHTML(t.audio)}" download title="Download audio" aria-label="Download ${escapeHTML(t.title)}">${window.platformIcon('download')}</a>`:''}</div></li>`).join('')}</ol><p class="release-copyright">${escapeHTML(release.copyright)}</p>`;
 // The native dialog handles focus trapping, Escape and returning focus to the cover.
 document.body.append(dialog);dialog.querySelector('.release-dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();updateTrackDetails();
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-release-open]');if(button)openRelease(button.dataset.releaseOpen);});
window.addEventListener('pagenavigate',()=>document.getElementById('release-dialog')?.close());
