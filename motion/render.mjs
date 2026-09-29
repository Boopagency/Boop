// Renderiza o filme quadro a quadro no Chromium e codifica em MP4 (H.264 + AAC).
//   node motion/render.mjs [--film boop-film-02] [--fps 30] [--blur 4] [--from 0] [--to 33.5] [--out motion/dist/boop-olhe-alem.mp4]
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

// vídeo: subquadros entram no ffmpeg a fps*blur e são misturados em grupos (tmix) antes de reduzir para fps
const vf = blur > 1 ? `tmix=frames=${Math.ceil(blur / 2)}:weights='${Array(Math.ceil(blur / 2)).fill(1).join(' ')}',select='not(mod(n\\,${blur}))',setpts=N/${fps}/TB` : 'null';
const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps * blur), '-i', '-',
  '-ss', String(from), '-i', wav,
  '-vf', vf, '-r', String(fps), '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-af', loud, '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });

let ffExit = null;
ff.on('exit', c => { ffExit = c; });
ff.stdin.on('error', () => {});
const total = Math.round((to - from) * fps * blur);
const started = Date.now();
for (let i = 0; i < total; i++) {
  // o subquadro i mostra o instante do meio da sua fatia de obturador
  const t = from + i / (fps * blur);
  if (ffExit !== null) throw new Error(`ffmpeg encerrou antes da hora (código ${ffExit}) no quadro ${i}`);
  const png = await shot(t);
  if (!ff.stdin.write(png)) await new Promise(r => { ff.stdin.once('drain', r); ff.once('exit', r); });
  if (i % (fps * blur) === 0) process.stdout.write(`\r${(i / total * 100).toFixed(0)}% · ${((Date.now() - started) / 1000).toFixed(0)}s`);
}
ff.stdin.end();
await new Promise((r, j) => ffExit !== null ? (ffExit ? j(new Error('ffmpeg ' + ffExit)) : r()) : ff.on('close', c => c ? j(new Error('ffmpeg ' + c)) : r()));
await browser.close();
console.log(`\nvídeo: ${out}`);
