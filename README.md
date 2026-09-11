# Boop — Olhe além.

Homepage da consultoria de gestão de marca e crescimento Boop. Direção editorial de campanha, desenvolvida a partir do MASTER, do brandbook, dos materiais institucionais e da reformulação solicitada pelo usuário.

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

- `index.html`: conteúdo semântico, metadados e narrativa.
- `src/tokens.css`: tokens da identidade fornecida.
- `src/campaign.css`: composição editorial, responsividade e estados visuais.
- `src/campaign.ts`: menu, abas acessíveis, sequência do método e narrativa de scroll.
- `public/assets`: materiais institucionais, escultura original e texturas.
- `docs/direcao-e-fontes.md`: decisões e procedência.
- `docs/hero-image-prompt.txt`: prompt completo do objeto central gerado.
- `docs/validacao.md`: verificação e limites.

A hero usa uma escultura óptica criada para a Boop, letras monumentais e dissolução granular. A virada “Preciso de um site.” → “O que precisa mudar no seu negócio?” e o CTA ciano “Dê um boop.” foram preservados em essência e redesenhados.

As capacidades funcionam como três cenas tipográficas selecionáveis. O método é uma sequência horizontal com toque, controles e teclado. O movimento reduzido desativa transformações e fixação; no celular, a virada mantém a transformação pelo scroll sem fixar a seção.

## Conteúdo e publicação

O contato confirmado é `contato@deumboop.com.br`. O domínio institucional `https://deumboop.com.br/` é usado em canonical, sitemap e dados estruturados. O domínio da marca não foi alterado por este projeto.

Hapuck, Hertmann e Velmont estão reservados para uma etapa futura. Não são apresentados como cases existentes, e nenhuma métrica ou resultado foi inventado.
