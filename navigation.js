(() => {
 // Only the main content changes. The audio element, analyser and player stay mounted.
 const cache=new Map();let pending=0;
 const pageOf=url=>url.pathname.endsWith('/discography.html')?'discography':'home';
 const supported=url=>url.origin===location.origin && /\/(?:index\.html|discography\.html)?$/.test(url.pathname) && new URL('.',url).pathname===new URL('.',location.href).pathname;
 const currentURL=new URL(location.href);
 cache.set(pageOf(currentURL),{main:document.querySelector('main').outerHTML,title:document.title,description:document.querySelector('meta[name="description"]').content});
 history.scrollRestoration='manual';
 history.replaceState({...history.state,scrollY:scrollY},'',location.href);
 function scrollPage(url,y){const target=url.hash&&document.getElementById(decodeURIComponent(url.hash.slice(1)));if(target)target.scrollIntoView();else window.scrollTo(0,y||0);}
 async function navigate(url,{push=true,y=0}={}){
  const sequence=++pending,page=pageOf(url);
  if(page===document.body.dataset.page){if(push){history.replaceState({...history.state,scrollY:scrollY},'',location.href);history.pushState({scrollY:0},'',url);}scrollPage(url,y);return;}
  try{
   let content=cache.get(page);
   if(!content){const response=await fetch(url.pathname);if(!response.ok)throw Error('Page unavailable');const doc=new DOMParser().parseFromString(await response.text(),'text/html');const main=doc.querySelector('main');if(!main||doc.body.dataset.page!==page)throw Error('Unexpected page');content={main:main.outerHTML,title:doc.title,description:doc.querySelector('meta[name="description"]')?.content||''};cache.set(page,content);}
   if(sequence!==pending)return;
   if(push){history.replaceState({...history.state,scrollY:scrollY},'',location.href);history.pushState({scrollY:0},'',url);}
   const template=document.createElement('template');template.innerHTML=content.main;document.querySelector('main').replaceWith(template.content.firstElementChild);
   document.body.dataset.page=page;document.title=content.title;document.querySelector('meta[name="description"]').content=content.description;
   document.querySelectorAll('header .wordmark,footer .wordmark').forEach(link=>link.href='index.html#top');
   const music=document.querySelector('header nav a');music.toggleAttribute('aria-current',page==='discography');if(page==='discography')music.setAttribute('aria-current','page');
   document.querySelector('header nav a:nth-child(2)').href='index.html#people';
   window.mountCatalog();window.renderFeaturedRelease();window.renderFeaturedStreamingLinks();updateTrackDetails();
   document.getElementById('navigation-status')?.remove();scrollPage(url,y);
   window.dispatchEvent(new Event('pagenavigate'));
  }catch(error){if(sequence!==pending)return;let status=document.getElementById('navigation-status');if(!status){status=document.createElement('p');status.id='navigation-status';status.setAttribute('role','alert');document.querySelector('main').prepend(status);}status.textContent='This page could not load. Please try the link again. Your music is still playing.';}
 }
 document.addEventListener('click',event=>{const link=event.target.closest('a[href]');if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.target||link.hasAttribute('download'))return;const url=new URL(link.href);if(!supported(url))return;if(url.pathname===location.pathname&&url.hash)return;event.preventDefault();navigate(url);});
 window.addEventListener('popstate',event=>{const url=new URL(location.href);if(supported(url))navigate(url,{push:false,y:event.state?.scrollY||0});});
})();
