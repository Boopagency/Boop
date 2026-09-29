// Gera motion/dist/<filme>.html: um único arquivo por filme, com fontes e imagens embutidas.
//   node motion/build.mjs            → todos os boop-film*.html
//   node motion/build.mjs boop-film-02
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const types = { '.woff2': 'font/woff2', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };

const wanted = process.argv[2];
const films = (await readdir(here)).filter(f => /^boop-film.*\.html$/.test(f) && (!wanted || f === wanted + '.html'));
if (!films.length) throw new Error(`Nenhum filme encontrado: ${wanted}`);
await mkdir(resolve(here, 'dist'), { recursive: true });
for (const film of films) {
  let html = await readFile(resolve(here, film), 'utf8');
  const refs = [...new Set(html.match(/\.\.\/(?:public|node_modules)\/[^'")\s]+/g))];
  for (const ref of refs) {
    const type = types[extname(ref)];
    if (!type) throw new Error(`Tipo desconhecido: ${ref}`);
    const data = (await readFile(resolve(here, ref))).toString('base64');
    html = html.replaceAll(ref, `data:${type};base64,${data}`);
  }
  await writeFile(resolve(here, 'dist', film), html);
  console.log(`dist/${film} · ${refs.length} recursos embutidos · ${(html.length / 1024).toFixed(0)} KB`);
}
