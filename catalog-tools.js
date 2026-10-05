window.catalogTools = (() => {
 const names=new Intl.Collator('en',{numeric:true,sensitivity:'base'});
 function seconds(track){
  if(Number.isFinite(track.durationSeconds))return track.durationSeconds;
  if(!/^\d+(?::\d{2}){1,2}$/.test(track.duration||''))return null;
  return track.duration.split(':').reduce((total,part)=>total*60+Number(part),0);
 }
 function date(track){return (track.releaseStatus==='official'?track.officialReleaseDate||track.releaseDate:track.releaseDate)||null;}
 function filter(tracks,{artist='All',query='',status='all',length='all'}={}){
  const term=query.trim().toLocaleLowerCase();
  return tracks.filter(track=>{
   const duration=seconds(track);
   return (artist==='All'||track.artist===artist)&&
    (track.title+' '+track.artist+' '+(track.credit||'')).toLocaleLowerCase().includes(term)&&
    (status==='all'||track.releaseStatus===status)&&
    (length==='all'||length==='wip'&&duration!==null&&duration<90||length==='full'&&duration!==null&&duration>=90||length==='unknown'&&duration===null);
  });
 }
 function sort(tracks,order='newest'){
  return [...tracks].sort((a,b)=>{
   if(order==='name-asc'||order==='name-desc')return (names.compare(a.title,b.title)||names.compare(a.artist||'',b.artist||'')||names.compare(a.id||'',b.id||''))*(order==='name-desc'?-1:1);
   const first=date(a),second=date(b);
   if(!first||!second)return first?-1:second?1:names.compare(a.title,b.title);
   return first.localeCompare(second)*(order==='oldest'?1:-1)||names.compare(a.title,b.title);
  });
 }
 return {seconds,date,filter,sort};
})();

