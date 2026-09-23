import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {site,pages} from '../site.config.mjs';
import {securityHeaders} from './site-meta.mjs';
const home=await readFile('dist/index.html','utf8');
for(const page of pages){
 const html=await readFile(`dist/${page.file}`,'utf8');
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`${page.file}: one h1`);
 assert(html.includes(`<title>${page.title}</title>`));
 assert(html.includes('name="description"'));
 assert(!html.includes('<!-- SEO -->'));
 assert(!/localhost|127\.0\.0\.1|\.vercel\.app\b/.test(html.match(/<head>[\s\S]*<\/head>/)[0]),`${page.file}: temporary host in head`);
 if(page.index)assert(html.includes(`rel="canonical" href="${site.url}${page.path}"`));
 else assert(html.includes('noindex, follow'));
 for(const img of html.matchAll(/<img\b[^>]*>/g))assert(/\balt=/.test(img[0])&&/\bwidth=/.test(img[0])&&/\bheight=/.test(img[0]),img[0]);
 for(const match of html.matchAll(/(?:src|href)="(\/[^"?#]*)/g)){
  let path=match[1];if(path.endsWith('/'))path+='index.html';
  assert((await stat(`dist${path}`)).isFile(),path);
 }
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,'unique IDs');
 for(const a of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(a[1]),a[1]);
}
const json=home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
JSON.parse(json);
assert(securityHeaders['Content-Security-Policy'].includes(createHash('sha256').update(json).digest('base64')));
for(const person of site.people)assert(home.includes(person.name)&&home.includes(person.jobTitle));
assert(!/<iframe\b/.test(home),'Instagram must require opt-in');
assert(!/[↗↘]/u.test(home),'directional arrows are SVG');
assert((await stat(`dist${site.socialImage}`)).isFile(),'social image');
assert(home.includes(`property="og:image" content="${site.url}${site.socialImage}"`));
const sitemap=await readFile('dist/sitemap.xml','utf8');
assert(!sitemap.includes('404'));
for(const page of pages.filter(p=>p.index))assert(sitemap.includes(site.url+page.path));
assert((await readFile('dist/robots.txt','utf8')).includes(site.url+'/sitemap.xml'));
assert((await readFile('dist/_headers','utf8')).includes('Content-Security-Policy'));
console.log('Build audit passed: pages, metadata, schema/CSP, images, links, sitemap, opt-in embed.');
