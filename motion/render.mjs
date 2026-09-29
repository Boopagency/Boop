// Renderiza o filme quadro a quadro no Chromium e codifica em MP4 (H.264 + AAC).
//   node motion/render.mjs [--film boop-film-02] [--fps 30] [--blur 4] [--from 0] [--to 33.5] [--out motion/dist/boop-olhe-alem.mp4]
//   --blur N: amostra N subquadros por quadro e mistura (motion blur de obturador 180°).
//   --stills 1.5,11.4,...: só exporta PNGs desses instantes.
//   --segments 4: renderiza em partes de 4 s salvas em dist/<filme>-partes/. Se o processo cair,
//   rodar de novo retoma da primeira parte que falta; no fim as partes são unidas sem recompressão.
// Requer ffmpeg com libx264 (variável FFMPEG ou no PATH) e o Chromium do Playwright (CHROMIUM opcional).
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { writeFile, mkdir, rename, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') && a.push([v.slice(2), all[i + 1]]), a), []));
const fps = +(args.fps ?? 30);
const blur = +(args.blur ?? 1);
const film = args.film ?? 'boop-film';
const out = resolve(args.out ?? resolve(here, `dist/${film}.mp4`));
const ffmpeg = process.env.FFMPEG ?? 'ffmpeg';
const executablePath = process.env.CHROMIUM ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

const browser = await chromium.launch({ executablePath, args: ['--autoplay-policy=no-user-gesture-required', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve(here, `dist/${film}.html`)).href + '?render');
await page.evaluate(() => window.ready);
const DUR = await page.evaluate(() => window.DUR);
const from = +(args.from ?? 0), to = Math.min(+(args.to ?? DUR), DUR);
await mkdir(dirname(out), { recursive: true });

const shot = async t => { await page.evaluate(t => window.seek(t), t); return page.screenshot({ type: 'png' }); };

if (args.stills) {
  for (const s of args.stills.split(',').map(Number)) {
    const file = resolve(dirname(out), `${film}-still-${s.toFixed(2).padStart(5, '0')}.png`);
    await writeFile(file, await shot(s)); console.log(file);
  }
  await browser.close(); process.exit(0);
}

// trilha
const wav = resolve(dirname(out), `${film}-trilha.wav`);
const pcm = await page.evaluate(async () => {
  const buf = await window.renderAudio(48000);
  const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
  const i16 = new Int16Array(n * 2);
  for (let i = 0; i < n; i++) { i16[i * 2] = Math.max(-1, Math.min(1, L[i])) * 32767; i16[i * 2 + 1] = Math.max(-1, Math.min(1, R[i])) * 32767; }
  const bytes = new Uint8Array(i16.buffer); let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
});
const data = Buffer.from(pcm, 'base64');
const head = Buffer.alloc(44);
head.write('RIFF', 0); head.writeUInt32LE(36 + data.length, 4); head.write('WAVE', 8); head.write('fmt ', 12);
head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(2, 22); head.writeUInt32LE(48000, 24);
head.writeUInt32LE(48000 * 4, 28); head.writeUInt16LE(4, 32); head.writeUInt16LE(16, 34); head.write('data', 36); head.writeUInt32LE(data.length, 40);
await writeFile(wav, Buffer.concat([head, data]));
console.log('trilha:', wav);

// volume de redes sociais (-14 LUFS) em duas etapas: mede, aplica ganho fixo e um limitador (silêncios continuam silêncio)
const measure = await new Promise((r, j) => {
  const p = spawn(ffmpeg, ['-hide_banner', '-i', wav, '-af', 'loudnorm=I=-14:TP=-1:LRA=20:print_format=json', '-f', 'null', '-']);
  let log = ''; p.stderr.on('data', d => log += d); p.on('close', c => c ? j(new Error('loudnorm ' + c)) : r(JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1))));
});
const loud = `volume=${(-14 - measure.input_i).toFixed(2)}dB,alimiter=limit=0.89:attack=3:release=50:level=disabled`;

// vídeo: subquadros entram no ffmpeg a fps*blur e são misturados em pares (tmix) antes de reduzir para fps.
// Cada parte começa um subquadro antes, para que o primeiro quadro também tenha rastro.
const run = (argv, opts) => new Promise((r, j) => { const p = spawn(ffmpeg, argv, opts); p.on('close', c => c ? j(new Error('ffmpeg ' + c)) : r()); });
const sub = 1 / (fps * blur);
const vf = blur > 1 ? `tmix=frames=2:weights='1 1',select='not(mod(n-1\,${blur}))',setpts=N/${fps}/TB` : 'null';
async function encode(a, b, file) {
  const part = file + '.part.mp4';
  const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps * blur), '-i', '-',
    '-vf', vf, '-r', String(fps), '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', part],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  let ffExit = null;
  ff.on('exit', c => { ffExit = c; });
  ff.stdin.on('error', () => {});
  const n = Math.round((b - a) * fps) * blur + (blur > 1 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    if (ffExit !== null) throw new Error(`ffmpeg encerrou antes da hora (código ${ffExit}) no subquadro ${i}`);
    const t = a + (i - (blur > 1 ? 1 : 0)) * sub;
    const png = await shot(Math.max(0, t));
    if (!ff.stdin.write(png)) await new Promise(r => { ff.stdin.once('drain', r); ff.once('exit', r); });
    progress(t);
  }
  ff.stdin.end();
  await new Promise((r, j) => ffExit !== null ? (ffExit ? j(new Error('ffmpeg ' + ffExit)) : r()) : ff.on('close', c => c ? j(new Error('ffmpeg ' + c)) : r()));
  await rename(part, file);
}
const started = Date.now();
let shown = -1;
function progress(t) {
  const pct = Math.floor(clampP((t - from) / (to - from)) * 100);
  if (pct !== shown) { shown = pct; process.stdout.write(`\r${pct}% · ${((Date.now() - started) / 1000).toFixed(0)}s`); }
}
const clampP = x => Math.min(1, Math.max(0, x));

// partes alinhadas a quadros inteiros
const segLen = +(args.segments ?? (to - from));
const frames = Math.round((to - from) * fps), per = Math.max(1, Math.round(segLen * fps));
const partsDir = resolve(dirname(out), `${film}-partes`);
await mkdir(partsDir, { recursive: true });
const parts = [];
for (let f0 = 0; f0 < frames; f0 += per) {
  const a = from + f0 / fps, b = from + Math.min(frames, f0 + per) / fps;
  const file = resolve(partsDir, `${String(parts.length).padStart(2, '0')}-${a.toFixed(3)}-${b.toFixed(3)}-b${blur}.mp4`);
  parts.push(file);
  if (existsSync(file)) { console.log(`\nparte pronta, pulando: ${a.toFixed(2)}–${b.toFixed(2)} s`); continue; }
  await encode(a, b, file);
}
await browser.close();

// junta as partes (sem recomprimir) e aplica a trilha
const list = resolve(partsDir, 'lista.txt');
await writeFile(list, parts.map(f => `file '${f}'`).join('\n'));
await run(['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-ss', String(from), '-i', wav,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', loud, '-c:a', 'aac', '-b:a', '256k', '-t', String(frames / fps),
  '-movflags', '+faststart', out], { stdio: 'inherit' });
if (!args.keep) await rm(partsDir, { recursive: true, force: true });
console.log(`\nvídeo: ${out}`);
