# Validação da primeira versão

Verificação em 11 de setembro de 2026, em Chromium/Edge headless no Windows.

- Build de produção e verificação estrita de TypeScript: aprovados.
- Larguras 375, 430, 768, 1024, 1280, 1440 e 1920 px: sem overflow horizontal, sem imagens quebradas, Poppins carregada.
- Inspeção visual da hero em mobile, tablet, desktop e ultrawide; seções de conteúdo, método e contato conferidas em mobile e desktop.
- Menu: abre, fecha com Escape e fecha ao navegar; diálogo nativo com foco contido.
- Frentes de atuação: abrir e fechar pelo teclado funciona.
- Movimento reduzido: zero animações em execução e zero elementos de revelação pendentes; sticky e acompanhamento do ponteiro desativados.
- Conteúdo essencial e contato permanecem no HTML mesmo sem JavaScript.
- Auditoria axe-core 4.13, critérios `wcag2a`, `wcag2aa`, `wcag21aa`, em 375 e 1440 px: zero violações após corrigir o nome acessível da seta mobile. Auditoria automática não substitui avaliação completa com tecnologias assistivas.
- Console: nenhum erro registrado durante a navegação.

## Tamanho do build

JavaScript da aplicação: aproximadamente 8,7 KB (3,3 KB gzip). CSS: aproximadamente 21,6 KB (5,5 KB gzip). Fontes WOFF2 locais: aproximadamente 24 KB somando os três pesos. A imagem institucional e o retrato são carregados sob demanda.

## Limites desta revisão

Não foram executados testes em hardware físico de baixo desempenho, Safari ou Firefox. Nenhuma pontuação Lighthouse foi estimada. A eficácia comercial e os resultados de projetos não foram simulados. Os cases reais serão incorporados em etapa futura.
