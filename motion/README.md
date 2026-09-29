# Boop — “Olhe além.” · filme de motion design

Peça vertical 9:16 (1080 × 1920), 33,5 s, 120 BPM, feita para Reels, Stories e TikTok. Usa só a identidade do site: navy, ciano e osso, Poppins, tipografia vazada, sublinhado ciano, a escultura óptica e o símbolo dos olhos.

## Roteiro

| Tempo | Cena | O que acontece |
|---|---|---|
| 0–1,5 s | Pupila | Um ponto ciano pulsa como um coração e engole o quadro. |
| 1,5–4,5 s | Os pedidos | “Preciso de um site.” / “Quero postar mais.” / “Preciso vender melhor.”, um corte a cada tempo forte. |
| 4,5–9,5 s | A virada | Os pedidos são riscados. Entra “O que precisa mudar no seu negócio?” com o sublinhado ciano. |
| 9,5–14 s | Olhe além. | Pilha de palavras em contorno, escultura subindo e a câmera mergulhando na pupila. |
| 14–18,5 s | Frentes | A íris abre: *Ter voz.* / *Estar aqui.* / *Fazer fluir.* |
| 18,5–22 s | Tudo conectado | Marca, Presença e Operação ligadas. Tudo converge para o ponto. |
| 22–25,5 s | Método | Contagem de 01 a 05 (Entender → Medir). Depois “Nada por acaso.” e o estrobo. |
| 25,5–30 s | Dê um boop. | Os “oo” viram os olhos da marca: olham, piscam, e o CTA gira. |
| 30–33,5 s | Assinatura | Símbolo vetorial montado, pupilas vivas, “Olhe além.” e deumboop.com.br. |

## Como funciona

- `boop-film.html` é a fonte. Cada quadro é uma função pura do tempo (`seek(t)`), então o filme renderiza sempre igual.
- A trilha é sintetizada no próprio navegador (`OfflineAudioContext`): batimento, impactos, riser, e o “boop” como assinatura sonora. Segue a mesma linha do tempo, então cada corte cai no tempo.
- `build.mjs` embute fontes e imagens em `dist/boop-film.html`, um arquivo único que pode ser aberto em qualquer navegador (com player e som).
- `render.mjs` captura os quadros no Chromium, mistura subquadros para o motion blur e codifica H.264 + AAC.

## Gerar

```sh
pnpm install --frozen-lockfile
node motion/build.mjs
FFMPEG=/caminho/do/ffmpeg node motion/render.mjs --blur 4   # → motion/dist/boop-olhe-alem.mp4
node motion/render.mjs --stills 2,11.5,26.9                 # quadros soltos em PNG
```

É preciso ter um `ffmpeg` com libx264. `--blur 4` amostra quatro subquadros por quadro (obturador de 180°). Com `--blur 1`, o render fica 4× mais rápido, para prévias.

A pasta `motion/` não entra no build do site. `motion/dist/` fica fora do Git.
