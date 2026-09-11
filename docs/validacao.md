# Validação da direção editorial

Verificação em 11 de setembro de 2026, em Chromium/Edge headless no Windows.

- Build de produção e verificação estrita de TypeScript aprovados.
- Larguras 375, 430, 768, 1024, 1280, 1440 e 1920 px: sem overflow horizontal e sem imagens quebradas.
- Hero e seções revisadas visualmente em celular e desktop; tipografia extrema, imagem, crops e áreas de contato conferidos.
- Menu abre e fecha com Escape; diálogo nativo com foco contido.
- Capacidades: seleção por teclado, setas e End, estado aria-selected e painel correspondente verificados.
- Método: navegação até o fim e retorno ao início pelo teclado; controles anterior/próximo refletem os limites.
- Movimento reduzido: zero animações em execução e narrativa sem fixação.
- Auditoria axe-core 4.13, critérios wcag2a, wcag2aa e wcag21aa em 375 e 1440 px: zero violações. Auditoria automática não substitui avaliação completa com tecnologias assistivas.
- Console: nenhum erro registrado na navegação testada.

## Recursos

A escultura da hero pesa aproximadamente 289 KB em WebP e é carregada prioritariamente. A imagem institucional usa carregamento sob demanda. Fontes Poppins são hospedadas localmente. A animação usa APIs nativas, sem biblioteca de motion ou motor 3D em tempo real.

## Limites

Não foram executados testes em hardware físico de baixo desempenho, Safari ou Firefox. Nenhuma pontuação Lighthouse foi estimada. A eficácia comercial e os resultados de projetos não foram simulados. Os cases reais serão incorporados em etapa futura.
