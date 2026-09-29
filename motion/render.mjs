// Renderiza o filme quadro a quadro no Chromium e codifica em MP4 (H.264 + AAC).
//   node motion/render.mjs [--fps 30] [--blur 4] [--from 0] [--to 33.5] [--out motion/dist/boop-olhe-alem.mp4]
//   --blur N: amostra N subquadros por quadro e mistura (motion blur de obturador 180°).
//   --stills 1.5,11.4,...: só exporta PNGs desses instantes.
// Requer ffmpeg com libx264 (variável FFMPEG ou no PATH) e o Chromium do Playwright (CHROMIUM opcional).
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') && a.push([v.slice(2), all[i + 1]]), a), []));
const fps = +(args.fps ?? 30);
const blur = +(args.blur ?? 1);
const out = resolve(args.out ?? resolve(here, 'dist/boop-olhe-alem.mp4'));
const ffmpeg = process.env.FFMPEG ?? 'ffmpeg';
const executablePath = process.env.CHROMIUM ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

const browser = await chromium.launch({ executablePath, args: ['--autoplay-policy=no-user-gesture-required', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve(here, 'dist/boop-film.html')).href + '?render');
await page.evaluate(() => window.ready);
const DUR = await page.evaluate(() => window.DUR);
const from = +(args.from ?? 0), to = Math.min(+(args.to ?? DUR), DUR);
await mkdir(dirname(out), { recursive: true });

const shot = async t => { await page.evaluate(t => window.seek(t), t); return page.screenshot({ type: 'png' }); };

if (args.stills) {
  for (const s of args.stills.split(',').map(Number)) {
    const file = resolve(dirname(out), `still-${s.toFixed(2)}.png`);
    await writeFile(file, await shot(s)); console.log(file);
  }
  await browser.close(); process.exit(0);
}

// trilha
const wav = resolve(dirname(out), 'trilha.wav');
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

// vídeo: subquadros entram no ffmpeg a fps*blur e são misturados em grupos (tmix) antes de reduzir para fps
const vf = blur > 1 ? `tmix=frames=${Math.ceil(blur / 2)}:weights='${Array(Math.ceil(blur / 2)).fill(1).join(' ')}',select='not(mod(n\\,${blur}))',setpts=N/${fps}/TB` : 'null';
const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps * blur), '-i', '-',
  '-ss', String(from), '-i', wav,
  '-vf', vf, '-r', String(fps), '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });

const total = Math.round((to - from) * fps * blur);
const started = Date.now();
for (let i = 0; i < total; i++) {
  // o subquadro i mostra o instante do meio da sua fatia de obturador
  const t = from + i / (fps * blur);
  const png = await shot(t);
  if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % (fps * blur) === 0) process.stdout.write(`\r${(i / total * 100).toFixed(0)}% · ${((Date.now() - started) / 1000).toFixed(0)}s`);
}
ff.stdin.end();
await new Promise((r, j) => ff.on('close', c => c ? j(new Error('ffmpeg ' + c)) : r()));
await browser.close();
console.log(`\nvídeo: ${out}`);
