# Boop — Antes de fazer, olhar.

Homepage da consultoria de gestão de marca e crescimento Boop. Desenvolvida a partir de `BOOP-CODEX-MASTER.md`, do Design System Digital ATENÇÃO e dos materiais institucionais fornecidos.

## Desenvolvimento

Requer Node.js 22.12+ e pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm preview
```

O build gera um site estático em `dist/`, sem backend ou variáveis secretas. A publicação privada de revisão usa Sites; o código-fonte principal pertence a `Boopagency/Boop`.

## Estrutura

- `index.html`: conteúdo semântico, metadados e narrativa completa.
- `src/tokens.css`: tokens originais fornecidos.
- `src/style.css`: composição, responsividade e estados visuais.
- `src/main.ts`: menu nativo, olhar responsivo, narrativa de scroll e motion progressivo.
- `public/assets`: somente materiais da Boop otimizados para web.
- `docs/direcao-e-fontes.md`: decisões, procedência e pendências de conteúdo.

Nenhum conteúdo essencial depende de animação. O modo de movimento reduzido desativa transformações e fixação; o mobile recebe composição própria, sem pin ou rastreamento do ponteiro. Os serviços usam `details` nativo, acessível por teclado.

## Conteúdo e publicação

O contato confirmado é `contato@deumboop.com.br`. O domínio institucional informado nos materiais é `https://deumboop.com.br/` e é usado em canonical, sitemap e dados estruturados. O domínio da marca ainda não foi alterado por este projeto.

Os cases Hapuck, Hertmann e Velmont estão reservados para uma etapa futura, conforme orientação do usuário. Não são apresentados como trabalhos publicados, e nenhuma métrica ou resultado foi inventado.