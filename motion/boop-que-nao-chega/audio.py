"""Design de som de "O boop que não chega" (sem voz). Gera dist/boop-que-nao-chega.wav, 48 kHz estéreo.
Marcações (s): zumbido 0–7 sob o vídeo real (corte seco) · whoosh 8–10 · rolagem 10,5–14,75 ·
whoosh de volta 15–17 · silêncio 17,5–18 · boop 18 · voo/pops 18,6–19,8 · acorde 20–24."""
import os, wave
import numpy as np

SR, DUR = 48000, 24.0
N = int(SR * DUR)
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N); SEND = np.zeros(N)
rnd = np.random.default_rng(7)

def idx(s): return int(round(s * SR))

def add(sig, at, pan=0.0, gain=1.0, send=0.0):
    i = idx(at); sig = sig[: max(0, N - i)] * gain
    L[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2) * 1.414
    R[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2) * 1.414
    SEND[i:i + len(sig)] += sig * send

def biquad(x, fc, q, kind):
    """Filtro de segunda ordem com corte variável (fc pode ser array)."""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    w = 2 * np.pi * np.clip(fc, 20, SR * .45) / SR
    al = np.sin(w) / (2 * q); c = np.cos(w)
    if kind == 'lp': b0, b1, b2 = (1 - c) / 2, 1 - c, (1 - c) / 2
    else: b0, b1, b2 = al, np.zeros_like(w), -al  # band-pass
    a0, a1, a2 = 1 + al, -2 * c, 1 - al
    y = np.zeros_like(x); x1 = x2 = y1 = y2 = 0.0
    for n in range(len(x)):
        y[n] = (b0[n] * x[n] + b1[n] * x1 + b2[n] * x2 - a1[n] * y1 - a2[n] * y2) / a0[n]
        x2, x1, y2, y1 = x1, x[n], y1, y[n]
    return y

def seg(a, b): return np.arange(idx(b) - idx(a)) / SR
def fade(sig, ms=3):
    k = min(len(sig), int(SR * ms / 1000)); sig[:k] *= np.linspace(0, 1, k); sig[-k:] *= np.linspace(1, 0, k); return sig

# zumbido grave subindo (0–7 s), corte seco
def drone(a, b, f0, f1, g0, g1):
    s = seg(a, b); k = s / s[-1]
    f = f0 * (f1 / f0) ** k
    ph = 2 * np.pi * np.cumsum(f) / SR
    ph2 = 2 * np.pi * np.cumsum(f * 1.007) / SR
    x = np.sin(ph) + .55 * np.sin(2 * ph + .3) + .3 * np.sin(3 * ph) + .16 * np.sin(4 * ph + 1) + .6 * np.sin(ph2) + .25 * np.sin(2 * ph2)
    x += .35 * biquad(rnd.standard_normal(len(s)), 140, .7, 'lp')
    x += .05 * np.sin(16 * ph) * k ** 2  # a tensão aguda que cresce
    return fade(x * (g0 + (g1 - g0) * k ** 1.7), 2)
add(drone(0, 7, 38, 56, .05, .5), 0)
add(drone(15.2, 17.5, 46, 56, .0, .22), 15.2)  # volta discreta, corta no silêncio

# (sem tique-taque: os primeiros 7 s são o vídeo real, sem contador)
for i, at in enumerate([]):
    s = np.arange(int(.03 * SR)) / SR
    x = np.sin(2 * np.pi * (3200 if i % 2 else 2700) * s) * np.exp(-s / .006)
    x[:96] += biquad(rnd.standard_normal(96), 6000, .9, 'bp') * np.linspace(1, 0, 96)
    add(x, at, pan=-.35, gain=.13, send=.05)

def whoosh(a, b, f0, fpk, f1, peak, gain, pan0=0., pan1=0.):
    s = seg(a, b); k = s / s[-1]
    env = np.where(k < peak, (k / peak) ** 2, ((1 - k) / (1 - peak)) ** 1.5)
    fc = np.where(k < peak, f0 + (fpk - f0) * k / peak, fpk + (f1 - fpk) * (k - peak) / (1 - peak))
    x = biquad(rnd.standard_normal(len(s)), fc, 1.2, 'bp') * env
    i = idx(a); pan = pan0 + (pan1 - pan0) * k
    L[i:i + len(s)] += x * gain * np.sqrt((1 - pan) / 2) * 1.414
    R[i:i + len(s)] += x * gain * np.sqrt((1 + pan) / 2) * 1.414
    SEND[i:i + len(s)] += x * gain * .2

whoosh(8.0, 10.2, 250, 2200, 500, .45, .55, 0, -.4)       # zoom out
whoosh(15.0, 17.25, 400, 2600, 300, .68, .5, -.4, 0)      # zoom in

# rolagem do feed: um "swipe" por post e um toque suave ao assentar
SNAP = [10.55, 11.08, 11.5, 11.86, 12.18, 12.48, 12.78, 13.1, 13.46, 13.95, 14.75]
for i in range(len(SNAP) - 1):
    a, b = SNAP[i], SNAP[i + 1]
    whoosh(a, a + min(.32, (b - a) * .85), 900, 3800, 1500, .4, .22, -.25, -.15)
    s = np.arange(int(.05 * SR)) / SR
    add(np.sin(2 * np.pi * 140 * s) * np.exp(-s / .012), a + (b - a) * .78 if i < len(SNAP) - 2 else b, pan=-.2, gain=.2)

# BOOP (18 s): seno redondo com queda de altura, corpo, sub, estalo e brilho
s = np.arange(int(.6 * SR)) / SR
f = 205 + 300 * np.exp(-s / .035)
ph = 2 * np.pi * np.cumsum(f) / SR
wob = 1 + .25 * np.exp(-5.5 * s) * np.sin(2 * np.pi * 3.1 * s)
boop = (np.sin(ph) + .18 * np.sin(2 * ph) + .06 * np.sin(3 * ph)) * np.minimum(1, s / .004) * np.exp(-s / .13) * wob
boop += .55 * np.sin(2 * np.pi * 68 * s) * np.exp(-s / .09) * np.minimum(1, s / .003)
click = biquad(rnd.standard_normal(len(s)), 2600, .8, 'bp') * np.exp(-s / .0025)
add(boop + .5 * click, 18.0, gain=.95, send=.35)
for k in range(14):  # partículas
    sp = np.arange(int(.12 * SR)) / SR
    x = biquad(rnd.standard_normal(len(sp)), 7000 + 3000 * rnd.random(), 4, 'bp') * np.exp(-sp / .03)
    add(x, 18.02 + rnd.random() * .45, pan=rnd.uniform(-.8, .8), gain=.08, send=.3)

# voo até o olho e pops elásticos
s = seg(18.6, 19.0); k = s / s[-1]
add(fade(np.sin(2 * np.pi * np.cumsum(600 + 800 * k ** 2) / SR) * np.sin(np.pi * k) ** 2), 18.6, gain=.07, send=.3)
def pop(f0, f1, dur=.12):
    s = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-s / .02)) / SR) * np.minimum(1, s / .002) * np.exp(-s / .035)
add(pop(450, 900), 19.0, pan=-.2, gain=.3, send=.3)
add(pop(600, 1150), 19.28, pan=.25, gain=.3, send=.3)
add(pop(900, 1500, .08), 19.42, gain=.12, send=.3)
add(pop(1100, 1700, .06), 19.5, pan=.3, gain=.1, send=.3)
add(pop(1400, 900, .05), 19.74, gain=.06, send=.2)  # piscada

# cartão final: whoosh do wipe e acorde suave (Cadd9/6)
whoosh(19.95, 20.8, 300, 1400, 700, .5, .18)
for j, fr in enumerate([130.81, 196.0, 329.63, 440.0, 587.33]):
    s = np.arange(idx(24) - idx(20.02 + j * .03)) / SR
    tine = sum(a * np.sin(2 * np.pi * fr * h * s) * np.exp(-s / d) for h, a, d in [(1, 1, 2.2), (2, .3, .6), (3, .12, .3), (4, .05, .15)])
    pad = (np.sin(2 * np.pi * fr * s) + np.sin(2 * np.pi * fr * 1.004 * s)) * .25 * np.minimum(1, s / .45)
    add((tine * np.minimum(1, s / .006) + pad) * np.exp(-s / 3.2), 20.02 + j * .03, pan=(j - 2) * .22, gain=.1, send=.45)

# reverb curta (convolução com ruído decaindo) e master
ir_t = np.arange(int(1.6 * SR)) / SR
def ir(): return rnd.standard_normal(len(ir_t)) * np.exp(-ir_t / .32)
n2 = 1 << int(np.ceil(np.log2(N + len(ir_t))))
S = np.fft.rfft(SEND, n2)
L += np.fft.irfft(S * np.fft.rfft(ir(), n2), n2)[:N] * .018
R += np.fft.irfft(S * np.fft.rfft(ir(), n2), n2)[:N] * .018
mix = np.stack([L, R], 1)
mix[idx(17.5):idx(18.0)] = 0  # silêncio absoluto
mix[-int(.06 * SR):] *= np.linspace(1, 0, int(.06 * SR))[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix *= .89 / np.abs(mix).max()

os.makedirs(os.path.join(os.path.dirname(__file__) or '.', 'dist'), exist_ok=True)
with wave.open(os.path.join(os.path.dirname(__file__) or '.', 'dist', 'boop-que-nao-chega.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', mix.shape)
