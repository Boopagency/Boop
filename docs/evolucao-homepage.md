# Evolução da homepage — setembro de 2026

Preservados: hero Olhe além., escultura óptica, logo, Poppins, paleta navy/ciano/osso, contato e CTA Dê um boop.

## Conteúdo confirmado na conversa

- Links de trabalhos fornecidos pelo usuário: https://www.hapuck.com.br/, https://hertmann.vercel.app/ e https://www.grupovelmont.com/.
- Cases publicados nesta composição: websites Hertmann e Hapuck Scents. A página aponta diretamente para os trabalhos. Não apresenta métricas, escopos adicionais ou resultados não confirmados.
- Velmont aparece na autoria do depoimento. Gestão de mídias de Velmont e Hertmann ainda não começou e não é apresentada como case.
- Danielle Cubas (Velmont): “Gostei bastante. Bem legal, isso que imaginávamos. Parabéns pessoal! Por isso desejo indicar os clientes para vocês! 🔥👏🏻”
- Barbara Hertmann: “Inclusive amamos o web site, o trabalho de vocês é incrível !”
- Os depoimentos foram fornecidos pelo usuário. Não há fotografias de autores; as iniciais são composição tipográfica.

## Imagens

Capas usam arquivos observados nos respectivos sites, sem geração de clientes ou resultados:

- Hapuck: https://www.hapuck.com.br/assets/img/col-difusores.webp
- Hertmann: /images/campaign-portrait.png e /images/hero-ring.png, entregues pelo otimizador do site em AVIF.
- O retrato Hertmann é imagem do projeto, não retrato de Barbara.

## Interação e acessibilidade

Scroll nativo, sem captura da roda do mouse nem biblioteca de animação. Seções usam sticky e atualização em requestAnimationFrame, medidas recalculadas no redimensionamento. Perguntas alternam e recebem risco; capacidades mudam automaticamente; processo transforma avanço vertical em deslocamento horizontal. Há atalhos para sair das seções e controles de teclado no processo.

Em movimento reduzido e telas com menos de 620px de altura, o conteúdo aparece no fluxo normal. Sem JavaScript, todas as frentes e etapas permanecem disponíveis. As imagens têm carregamento tardio, dimensões reservadas e formatos comprimidos. Fontes locais.

O ambiente desktop restringe subprocessos: a configuração Vite faz a transformação TypeScript no próprio processo. Fluxo validado: tsc --noEmit e vite build --configLoader native. Dependências e lockfile preservados.
