# Publicação Boop

## Comandos

- `pnpm install --frozen-lockfile`
- `pnpm build` verifica TypeScript, a configuração de segurança e a saída final.
- `pnpm dev` inicia a prévia local.
- `pnpm preview` serve a saída compilada.

O projeto é estático. Publique `dist/`; não reescreva caminhos inexistentes para a página inicial. A Vercel usa `vercel.json` e `404.html`. Hospedagens compatíveis com `_headers` recebem os mesmos cabeçalhos. Outros provedores precisam aplicar esses cabeçalhos e devolver HTTP 404 com `404.html`.

## Conteúdo e domínio

`site.config.mjs` centraliza domínio, metadados e dados da equipe. O build regenera automaticamente o hash da política de segurança em `vercel.json` a partir dele; rode `node scripts/deployment-config.mjs` manualmente só se quiser conferir o resultado antes de commitar. Os títulos/metadados, sitemap e robots são gerados pelo plugin local.

O endereço canônico é `https://deumboop.com.br` (sem www). Na Vercel, `deumboop.com.br` deve ser o domínio de produção e `www.deumboop.com.br` deve redirecionar (308) para ele. Confirme HTTPS e a página inicial depois de associar. Qualquer URL `*.vercel.app` recebe `X-Robots-Tag: noindex` por `vercel.json`, para que apenas o domínio oficial seja indexado. A imagem de compartilhamento é `public/assets/boop-og.jpg` (JPEG, compatível com WhatsApp, LinkedIn, Facebook e X).

## Privacidade e medição

Sem Analytics, Tag Manager ou pixel. Os eventos locais `boop:interaction` transportam somente `action` e `placement`; não armazenam dados nem enviam requisições. A integração futura deverá incluir a revisão de consentimento, privacidade e CSP antes de instalar scripts. Não coloque segredos em variáveis VITE_ ou no HTML.

O Instagram só é solicitado após o clique em Carregar publicações. Desativar remove o iframe e devolve o foco ao botão. O link externo funciona independentemente do embed. O contato usa mailto; não há formulário ou backend.

## Validação de 16/09/2026

- TypeScript e build de produção aprovados.
- Validação automatizada dos links internos/arquivos, metadados, schema, hash CSP, sitemap, imagens e carregamento opcional do Instagram aprovada.
- Nove larguras (320, 375, 390, 430, 768, 1024, 1280, 1440 e 1920): sem transbordamento horizontal da página ou cabeçalho.
- axe-core: zero violações nos critérios WCAG A/AA avaliados na página inicial; isso não constitui certificação de conformidade.
- Menu mobile e ativação/desativação do Instagram verificados no Chromium disponível.
- Consulta ao serviço público de advisories npm: 69 pacotes, nenhum aviso retornado.
- Safari/Firefox reais e Core Web Vitals de visitantes não foram medidos nesta estação. Não há dados de campo suficientes para garantir métricas reais antes do lançamento.

As fotos da equipe e cases possuem alternativas responsivas. A foto de Leonardo foi editada por IA a partir da referência fornecida, incluindo reconstrução do enquadramento; revisar identidade visual antes de usos fora do site.
