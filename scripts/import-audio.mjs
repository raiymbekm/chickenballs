import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';
const root=path.resolve(process.argv[2]||'.'),manifestPath=path.join(root,'audio-upload-manifest.json');
const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
let imported=0;
for(let i=0;i<manifest.files.length;i+=4)await Promise.all(manifest.files.slice(i,i+4).map(async file=>{
 if(!/^assets\/audio\/drive-archive\/[A-Za-z0-9_-]+\.mp3$/.test(file.path)||!/^\w{64}$/.test(file.sha256))throw Error('Invalid archive path');
 const target=path.join(root,file.path);try{const bytes=await fs.readFile(target);if(bytes.length===file.bytes&&hash(bytes)===file.sha256)return;}catch(error){if(error.code!=='ENOENT')throw error;}
 if(!manifest.transferBase||!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(manifest.transferBase))throw Error('Original MP3 is missing: '+file.filename);
 for(let attempt=0;attempt<3;attempt++)try{
  const response=await fetch(manifest.transferBase+'/'+file.sha256+'.mp3',{signal:AbortSignal.timeout(120000)});if(!response.ok)throw Error('HTTP '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length!==file.bytes||hash(bytes)!==file.sha256)throw Error('Audio checksum mismatch');
  await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes);imported++;console.log('Verified '+file.filename);return;
 }catch(error){if(attempt===2)throw Error(file.filename+': '+error.message);}
}));
if(manifest.transferBase){delete manifest.transferBase;manifest.completedAt=new Date().toISOString();await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');}
console.log('Original MP3s imported: '+imported+'; all '+manifest.files.length+' archive exports verified.');
