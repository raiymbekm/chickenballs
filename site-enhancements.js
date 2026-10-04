const themeIcons={
 moon:'<path d="M10 2H7v3H4v3H2v8h2v3h3v3h10v-3h3v-3h2v-4h-4v4h-7v-3H8V6h2z"/>',
 sun:'<path d="M10 1h4v4h-4zM10 19h4v4h-4zM1 10h4v4H1zM19 10h4v4h-4zM3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4zM9 7h6v2h2v6h-2v2H9v-2H7V9h2z"/>'
};
const themeButton=document.createElement('button');themeButton.className='theme-toggle';document.querySelector('header').append(themeButton);
let darkTheme=false;try{darkTheme=localStorage.getItem('chicken-balls-theme')==='dark';}catch{}
function applyTheme(){document.body.classList.toggle('dark-mode',darkTheme);themeButton.setAttribute('aria-pressed',String(darkTheme));const label=darkTheme?'Switch to light mode':'Switch to dark mode';themeButton.title=label;themeButton.setAttribute('aria-label',label);themeButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-icon="'+(darkTheme?'sun':'moon')+'">'+themeIcons[darkTheme?'sun':'moon']+'</svg>';}
themeButton.addEventListener('click',()=>{darkTheme=!darkTheme;applyTheme();try{localStorage.setItem('chicken-balls-theme',darkTheme?'dark':'light');}catch{}});applyTheme();
const randomButton=document.createElement('button');randomButton.className='header-random';randomButton.type='button';randomButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h5v3h5v3h5v6h-5v3H9v3H4z"/></svg><span>Play a random track</span>';themeButton.before(randomButton);
randomButton.addEventListener('click',()=>{
 const tracks=catalog.filter(track=>track.audio||track.youtube||track.soundcloud);
 if(!tracks.length)return;
 // Keep the user gesture: embedded platforms require playback to begin here.
 const random=tracks[Math.floor(Math.random()*tracks.length)];
 playTrack(random.id);
});
function squareDots(){const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode()){const n=walker.currentNode;if(!getComputedStyle(n.parentElement).fontFamily.startsWith('ChickenBalls')&&n.textContent.includes('.')&&!n.parentElement.closest('script,style,svg,.sr-only,.square-period,a[download],.archive-audio-player p'))nodes.push(n);}for(const n of nodes){const parts=n.textContent.split('.'),fragment=document.createDocumentFragment();parts.forEach((part,index)=>{fragment.append(document.createTextNode(part));if(index<parts.length-1){const dot=document.createElement('span');dot.className='square-period';dot.setAttribute('aria-hidden','true');const spoken=document.createElement('span');spoken.className='sr-only';spoken.textContent='.';fragment.append(dot,spoken);}});n.replaceWith(fragment);}}
squareDots();const catalogDotObserver=new MutationObserver(()=>{catalogDotObserver.disconnect();squareDots();catalogDotObserver.observe(document.body,{childList:true,subtree:true,characterData:true});});catalogDotObserver.observe(document.body,{childList:true,subtree:true,characterData:true});
const randomTracks=catalog.filter(track=>track.audio||track.youtube||track.soundcloud);const randomTrack=randomTracks[Math.floor(Math.random()*randomTracks.length)];if(randomTrack)playTrack(randomTrack.id);
