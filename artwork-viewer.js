(() => {
 const panel=document.getElementById('listening-room');
 const open=document.createElement('button');open.type='button';open.className='player-artwork-open';
 const thumbnail=document.createElement('img');thumbnail.alt='';open.append(thumbnail);panel.append(open);
 function update(){
  const cover=artwork[currentTrack.id];thumbnail.src=cover?.artwork||'assets/chicken-balls-logo-purple.svg';
  open.setAttribute('aria-label','View artwork for '+currentTrack.title);
  open.title='View and zoom artwork';
 }
 function show(){
  if(panel.classList.contains('is-minimized'))return;
  document.getElementById('artwork-dialog')?.close();
  const dialog=document.createElement('dialog');dialog.id='artwork-dialog';dialog.className='artwork-dialog';dialog.setAttribute('aria-labelledby','artwork-caption');
  dialog.innerHTML='<div class="artwork-dialog-toolbar"><button type="button" class="artwork-zoom-out" aria-label="Zoom out">−</button><span class="artwork-zoom-level" aria-live="polite">100%</span><button type="button" class="artwork-zoom-in" aria-label="Zoom in">+</button><button type="button" class="artwork-reset" aria-label="Reset artwork zoom">↺</button><button type="button" class="artwork-close" aria-label="Close artwork" autofocus>×</button></div><div class="artwork-viewport" tabindex="0" aria-label="Artwork. Use the zoom buttons or plus and minus keys to zoom."><div class="artwork-canvas"><img draggable="false"></div></div><h2 class="artwork-caption" id="artwork-caption"></h2><p class="artwork-credit"></p>';
  const image=dialog.querySelector('img');image.src=thumbnail.src;image.alt='Cover artwork for '+currentTrack.title;
  dialog.querySelector('.artwork-caption').textContent=currentTrack.title;
  dialog.querySelector('.artwork-credit').textContent=currentTrack.credit||currentTrack.artist;
  const viewport=dialog.querySelector('.artwork-viewport'),canvas=dialog.querySelector('.artwork-canvas');let zoom=1;
  function setZoom(value){
   zoom=Math.max(1,Math.min(4,value));canvas.style.width=zoom*100+'%';canvas.style.height=zoom*100+'%';
   dialog.querySelector('.artwork-zoom-level').textContent=Math.round(zoom*100)+'%';
   dialog.querySelector('.artwork-zoom-out').disabled=zoom===1;dialog.querySelector('.artwork-zoom-in').disabled=zoom===4;
   if(zoom===1){viewport.scrollTop=0;viewport.scrollLeft=0;}
  }
  dialog.querySelector('.artwork-zoom-in').addEventListener('click',()=>setZoom(zoom+.5));
  dialog.querySelector('.artwork-zoom-out').addEventListener('click',()=>setZoom(zoom-.5));
  dialog.querySelector('.artwork-reset').addEventListener('click',()=>setZoom(1));
  dialog.querySelector('.artwork-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('keydown',event=>{if(['+','=','-','0'].includes(event.key)){event.preventDefault();setZoom(event.key==='0'?1:zoom+(event.key==='-'?-.5:.5));}});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);setZoom(1);dialog.showModal();
 }
 open.addEventListener('click',show);window.addEventListener('trackchange',update);window.addEventListener('pagenavigate',()=>document.getElementById('artwork-dialog')?.close());update();
})();
