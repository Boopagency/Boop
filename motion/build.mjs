// Gera motion/dist/boop-film.html: um único arquivo, com fontes e imagens embutidas.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const types = { '.woff2': 'font/woff2', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };

let html = await readFile(resolve(here, 'boop-film.html'), 'utf8');
const refs = [...new Set(html.match(/\.\.\/(?:public|node_modules)\/[^'")\s]+/g))];
for (const ref of refs) {
  const type = types[extname(ref)];
  if (!type) throw new Error(`Tipo desconhecido: ${ref}`);
  const data = (await readFile(resolve(here, ref))).toString('base64');
  html = html.replaceAll(ref, `data:${type};base64,${data}`);
}
await mkdir(resolve(here, 'dist'), { recursive: true });
await writeFile(resolve(here, 'dist/boop-film.html'), html);
console.log(`dist/boop-film.html · ${refs.length} recursos embutidos · ${(html.length / 1024).toFixed(0)} KB`);
