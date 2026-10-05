import {readFile, writeFile, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
async function version(url, directory = root) {
  if (/^(?:https?:|data:|\/\/|#)/i.test(url)) return url;
  const [pathname] = url.split(/[?#]/);
  const file = path.resolve(directory, pathname);
  if (!file.startsWith(root)) throw new Error(`Asset outside site: ${url}`);
  const content = await readFile(file);
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
  return `${pathname}?v=${hash}`;
}
async function replaceAsync(text, expression, replacement) {
  const matches = [...text.matchAll(expression)];
  for (const match of matches.reverse()) {
    text = text.slice(0, match.index) + await replacement(match) + text.slice(match.index + match[0].length);
  }
  return text;
}
for (const name of await readdir(root)) {
  if (!name.endsWith('.css')) continue;
  const file = path.join(root, name);
  const original = await readFile(file, 'utf8');
  const updated = await replaceAsync(original, /url\((['"]?)([^)'"\s]+\.(?:ttf|woff2?)(?:\?[^)'"\s]*)?)\1\)/g,
    async ([, quote, url]) => `url(${quote}${await version(url)}${quote})`);
  if (updated !== original) await writeFile(file, updated);
}
for (const name of (await readdir(root)).filter(name=>name.endsWith('.html'))) {
 const htmlFile=path.join(root,name);
 const original=await readFile(htmlFile,'utf8');
 const updated=await replaceAsync(original, /\b(src|href)="([^"<>]+\.(?:js|css|ttf|woff2?)(?:\?[^"<>]*)?)"/g,
  async ([,attribute,url])=>`${attribute}="${await version(url)}"`);
 if(updated!==original)await writeFile(htmlFile,updated);
}
console.log('Validated and versioned scripts, stylesheets and fonts on every page.');

