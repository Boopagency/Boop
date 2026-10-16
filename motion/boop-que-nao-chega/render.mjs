// Gera a página única (dist/boop-que-nao-chega.html) e renderiza quadro a quadro.
//   node render.mjs                      -> dist/boop-que-nao-chega.mp4 (vídeo real 0–7 s + motion 7–24 s, com o áudio de dist/)
//   node render.mjs --stills 7,7.6,9     -> dist/stills/t-XX.png (só de 7 s em diante)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';

const here = new URL('.', import.meta.url).pathname;
const dist = here + 'dist/';
const FPS = 30, DUR = 24, CUT = 7;
mkdirSync(dist + 'stills', { recursive: true });

// 0–7 s: o começo do vídeo real (mão e lápis), até antes da legenda dele (6,77 s).
// O trecho dos lápis (2,13–6,77 s) é esticado 5% com interpolação para fechar exatamente 7 s.
if (!existsSync(dist + 'intro.mp4')){
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', here + 'intro-original.mp4', '-an', '-filter_complex',
    '[0:v]trim=end_frame=64,setpts=PTS-STARTPTS[a];' +
    '[0:v]trim=start_frame=64:end_frame=203,setpts=(PTS-STARTPTS)*1.0504,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc[b];' +
    '[a][b]concat=n=2:v=1,scale=1080:1920:flags=lanczos,unsharp=5:5:0.4,tpad=stop_mode=clone:stop=4,trim=end_frame=210,format=yuv420p',
    '-c:v', 'libx264', '-crf', '12', '-r', '30', dist + 'intro.mp4']);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-sseof', '-0.04', '-i', dist + 'intro.mp4', '-update', '1', '-q:v', '2', dist + 'freeze.jpg']);
}

const b64 = f => readFileSync(here + f).toString('base64');
const html = readFileSync(here + 'motion.html', 'utf8')
  .replace(/url\((vendor\/[^)]+\.woff2)\)/g, (_, f) => `url(data:font/woff2;base64,${b64(f)})`)
  .replace(/<script src="(vendor\/[^"]+)"><\/script>/g, (_, f) => `<script>${readFileSync(here + f, 'utf8')}</script>`);
writeFileSync(dist + 'boop-que-nao-chega.html', html);

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => { console.error(e); process.exit(1); });
await page.goto('file://' + dist + 'boop-que-nao-chega.html?render');
await page.evaluate(() => Promise.all([window.ready, document.querySelector('#real').decode()]));

const shot = async t => { await page.evaluate(t => window.seek(t), t); return page.screenshot({ type: 'png' }); };
const i = process.argv.indexOf('--stills');
if (i > 0){
  for (const t of process.argv[i + 1].split(',').map(Number)) writeFileSync(`${dist}stills/t-${String(t).padStart(5, '0')}.png`, await shot(t));
} else {
  const wav = dist + 'boop-que-nao-chega.wav';
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-i', dist + 'intro.mp4', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    ...(existsSync(wav) ? ['-i', wav] : []),
    '-filter_complex', '[0:v]trim=end_frame=210,setpts=PTS-STARTPTS[a];[a][1:v]concat=n=2:v=1[v]', '-map', '[v]', ...(existsSync(wav) ? ['-map', '2:a', '-c:a', 'aac', '-b:a', '256k'] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-t', String(DUR),
    dist + 'boop-que-nao-chega.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = CUT * FPS; f < FPS * DUR; f++){
    if (!ff.stdin.write(await shot(f / FPS))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 30 === 0) console.log(`quadro ${f}/${FPS * DUR} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}
await browser.close();
