# O boop que não chega — Reels 1080×1920, 30 fps, 24 s

Duas pontas de lápis quase se encostam e só se tocam no fim. É um vídeo sobre retenção.

| Arquivo | O que é |
|---|---|
| `motion.html` | Cena completa. WebGL (lápis em raymarching) + timeline GSAP determinística. Abra no navegador para ver a prévia; clique para tocar com som. |
| `render.mjs` | Gera `dist/boop-que-nao-chega.html` (página única, com GSAP e fontes embutidas) e renderiza quadro a quadro para `dist/boop-que-nao-chega.mp4`. |
| `audio.py` | Design de som sintetizado (sem voz) → `dist/boop-que-nao-chega.wav`. |

```bash
python3 audio.py                         # faixa de áudio
node render.mjs --stills 0,4,7,9,12,18   # quadros-chave em dist/stills
node render.mjs                          # MP4 final com o áudio (~40 min em CPU)
```

Requisitos: Node com `playwright` (Chromium) e `ffmpeg`; Python 3 com `numpy`.
`window.seek(t)` desenha o quadro do instante `t`. O vídeo inteiro é uma função do tempo, então
dá para exportar o mesmo vídeo de novo sem nenhuma diferença.

## Logo

- O **símbolo** é o SVG original da marca (`public/assets/olhar.svg`), colado sem nenhuma
  mudança no `<template id="simbolo">`. O código só agrupa as camadas que já existem (olho 1,
  olho 2, íris, pupilas, topete e chifre) e anima escala, posição, opacidade e as pupilas.
- A **logo completa** vai no `<template id="logo">`. Enquanto ele estiver vazio, o cartão final
  usa o símbolo. O repositório só tem a logo completa em versão clara (`logo-light.webp`, com
  letras brancas), que não aparece sobre o off-white. Cole ali o `boop-logo.svg` para fundo
  claro e renderize de novo.

## Marcações de som (s)

| Tempo | Som |
|---|---|
| 0,0–7,0 | Zumbido grave subindo (38→56 Hz, com harmônicos e um agudo de tensão), corte seco aos 7,0 |
| 1,2 · 2 · 3 · 4 · 5 · 6 · 7 | Tique-taque sutil, junto com o contador (puxado para a esquerda) |
| 7,0–8,0 | Silêncio (quadro congelado) |
| 8,0–10,2 | Whoosh do zoom out (desce para a esquerda, junto com o celular) |
| 10,55–14,75 | Rolagem: um swipe por post e um toque grave quando cada post assenta |
| 15,0–17,25 | Whoosh de volta (zoom in) + o zumbido volta baixinho |
| 17,5–18,0 | Silêncio absoluto |
| 18,0 | **Boop** (as pontas se tocam): seno redondo com queda de altura, sub de 68 Hz, estalo e brilho das partículas |
| 18,6–19,0 | Subida curta: a gota ciano voando até o olho |
| 19,0 · 19,28 · 19,4 · 19,5 · 19,74 | Pops elásticos (olho 1, olho 2, topete, chifre) e a piscada |
| 19,95–20,8 | Whoosh suave do wipe |
| 20,0–24,0 | Acorde suave e otimista (Cadd9/6), com fade de 60 ms no corte |

## Margens

Legendas numa coluna de x 640 a 960 (sobram 120 px à direita). Nada de texto abaixo de y 1700
(sobram 220 px embaixo). Contador em Inter Light 22 px, com 40% de opacidade.
