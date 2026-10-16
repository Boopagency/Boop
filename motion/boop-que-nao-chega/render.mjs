// Gera a página única (dist/boop-que-nao-chega.html) e renderiza quadro a quadro.
//   node render.mjs                      -> dist/boop-que-nao-chega.mp4 (com o áudio de dist/, se existir)
//   node render.mjs --stills 0,4,7,9     -> dist/stills/t-XX.png
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

const here = new URL('.', import.meta.url).pathname;
const dist = here + 'dist/';
const FPS = 30, DUR = 24;

const b64 = f => readFileSync(here + f).toString('base64');
const html = readFileSync(here + 'motion.html', 'utf8')
  .replace(/url\((vendor\/[^)]+\.woff2)\)/g, (_, f) => `url(data:font/woff2;base64,${b64(f)})`)
  .replace(/<script src="(vendor\/[^"]+)"><\/script>/g, (_, f) => `<script>${readFileSync(here + f, 'utf8')}</script>`);
mkdirSync(dist + 'stills', { recursive: true });
writeFileSync(dist + 'boop-que-nao-chega.html', html);

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => { console.error(e); process.exit(1); });
await page.goto('file://' + dist + 'boop-que-nao-chega.html?render');
await page.evaluate(() => window.ready);

const shot = async t => { await page.evaluate(t => window.seek(t), t); return page.screenshot({ type: 'png' }); };
const i = process.argv.indexOf('--stills');
if (i > 0){
  for (const t of process.argv[i + 1].split(',').map(Number)) writeFileSync(`${dist}stills/t-${String(t).padStart(5, '0')}.png`, await shot(t));
} else {
  const wav = dist + 'boop-que-nao-chega.wav';
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    ...(existsSync(wav) ? ['-i', wav, '-c:a', 'aac', '-b:a', '256k'] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-t', String(DUR),
    dist + 'boop-que-nao-chega.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < FPS * DUR; f++){
    if (!ff.stdin.write(await shot(f / FPS))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 30 === 0) console.log(`quadro ${f}/${FPS * DUR} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}
await browser.close();
