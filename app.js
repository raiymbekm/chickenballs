let selectedArtist='All';
let isDiscography,releaseFilter,lengthFilter,sortControl,list,search,more;
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function trackCard(t,i){
 const cover=artwork[t.id]||{artwork:'assets/chicken-balls-logo-purple.svg',missing:true};
 const date=catalogTools.date(t),duration=catalogTools.seconds(t);
 const releaseLabel=t.releaseStatus==='official'?'Released':t.releaseStatus==='unofficial'?'Unreleased':'Release unverified';
 const dateLabel=date?new Date(date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Date unconfirmed';
 const lengthLabel=duration===null?'Length unconfirmed':duration<90?'Short / WIP':'Full length';
 const link=(url,label)=>`<a href="${escapeHTML(url)}" target="_blank" rel="noopener" aria-label="${escapeHTML(t.title)} on ${label}">${label.toUpperCase()}</a>`;
 return `<article class="track" data-track="${t.id}"><div class="track-name"><span class="track-number">${String(i+1).padStart(2,'0')}</span><button class="art-play" data-play="${t.id}" aria-label="Play ${escapeHTML(t.title)}"><img src="${cover.artwork}" alt="${cover.missing?'Cover not on file':`Artwork for ${escapeHTML(t.title)}`}" loading="lazy" width="80" height="80"><span aria-hidden="true">▶</span></button><div><h4>${escapeHTML(t.title)}</h4><p>${escapeHTML(t.credit||t.artist)}</p><div class="copy-badge">${t.audio?'ARCHIVE COPY':'PLATFORM EMBED'}</div></div></div><span class="track-type"><span class="track-release-status">${releaseLabel}</span><span class="track-date">${dateLabel}</span><span class="track-length">${lengthLabel} · ${t.duration||'—'}</span></span><div class="track-links"><span class="duration">${t.duration||''}</span><button class="track-play" data-play="${t.id}" aria-label="Listen to ${escapeHTML(t.title)}">PLAY</button>${t.releaseStatus==='official'&&t.spotify?link(`https://open.spotify.com/${t.spotifyKind==='album'?'album':'track'}/${t.spotify}`,'Spotify'):''}${t.youtube?link(`https://www.youtube.com/watch?v=${t.youtube}`,'YouTube'):''}${t.soundcloud?link(t.soundcloud,'SoundCloud'):''}${t.audio?`<a href="${t.audio}" download="${escapeHTML(t.originalFilename||t.title+'.mp3')}">DOWNLOAD</a>`:''}</div></article>`;
}
function getFilteredTracks(){
 const source=isDiscography?catalog:catalog.filter(track=>track.releaseStatus==='official');
 return catalogTools.sort(catalogTools.filter(source,{artist:selectedArtist,query:search.value,status:releaseFilter?.value||'all',length:lengthFilter?.value||'all'}),sortControl?.value||'newest');
}
function render(){
 const found=getFilteredTracks(),displayed=isDiscography?found:found.slice(0,12);
 list.innerHTML=displayed.map(trackCard).join('');
 if(more)more.hidden=false;
 document.getElementById('results-status').textContent=found.length?(isDiscography?`${found.length} ${found.length===1?'track':'tracks'}`:`${displayed.length} latest released tracks`):'No tracks found. Try another title or filter.';
 document.getElementById('total-count').textContent=isDiscography?`${catalog.length} TRACKS / EVERY CHAPTER`:'THE LATEST 12 / RELEASED MUSIC';
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
viewControls.addEventListener('click',event=>{const button=event.target.closest('[data-view]');if(!button)return;const grid=button.dataset.view==='artwork';list.classList.toggle('artwork-grid',grid);document.querySelector('.list-header').hidden=grid;viewControls.querySelectorAll('button').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});});
render();

}
window.mountCatalog=mountCatalog;mountCatalog();
