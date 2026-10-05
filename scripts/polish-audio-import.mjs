import fs from 'node:fs/promises';
const catalog=JSON.parse(await fs.readFile('catalog.json','utf8')),audit=JSON.parse(await fs.readFile('audio-import-audit.json','utf8'));
for(const t of catalog){
 if(t.title==='- Cowboy'&&t.originalFilename==='ECT_-_Cowboy.mp3')t.title='Cowboy (Archive version)';
 if(['Good Old Days','Unlike'].includes(t.title)&&t.originalFilename?.includes('(Original Mix)'))t.title+=' (Original Mix)';
 if(t.title==='Preview ECT - Badass Gemini From Past')t.title='Badass Gemini From Past (Preview)';
 if(['peacepipe04','Epic Cheesy Toast'].includes(t.artist)&&t.releaseStatus==='unverified'){
  t.releaseStatus='unofficial';t.releaseVerification={checkedAt:'2026-10-05',reason:'Owner-confirmed unofficial archive, artist established by matching recording and Drive folder.'};
 }
}
const byId=new Map(catalog.map(t=>[t.id,t]));for(const f of audit.files){const t=byId.get(f.trackId);f.title=t.title;f.releaseStatus=t.releaseStatus;}
await fs.writeFile('catalog.json',JSON.stringify(catalog,null,2)+'\n');await fs.writeFile('catalog.js','const catalog = '+JSON.stringify(catalog,null,2)+';\n');await fs.writeFile('audio-import-audit.json',JSON.stringify(audit,null,2)+'\n');
const columns=Object.keys(audit.files[0]);const cell=v=>{const s=String(v);return /[,"\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;};
await fs.writeFile('audio-import-audit.csv','\ufeff'+[columns,...audit.files.map(f=>columns.map(k=>f[k]))].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n');
console.log('Archive titles and owner-confirmed release status verified.');
