# Revisão de UX e acessibilidade — 22/10/2026

## Implementação

Preservados o redesign, os quatro projetos, os ativos da logo e o footer premium local de três colunas. A imagem enviada é referência visual; não substitui o footer por um bitmap. Não havia gravação anexada disponível.

- Textos corridos principais em 16 px, apoio em 12–15 px, CTAs e campos mais legíveis; redução moderada do espaçamento das seções.
- Alvos de interação ampliados, foco dourado de 3 px, campos com bordas contrastantes, conteúdo visível mesmo antes das animações.
- Títulos exatos: home `Coderland | Tecnologia que transforma negócios`; projetos `{nome} | Projetos Coderland`. Descrições específicas, canonical e Open Graph preservados.
- Header indica Projetos nas páginas individuais. Escape e saída de foco fecham o menu; chat devolve foco ao botão ao fechar. Atalho para o conteúdo recebe foco.
- Âncoras de entrada resolvidas após a montagem do React, mantendo links reais e o histórico nativo.
- CTAs “Conhecer projeto” com nomes acessíveis específicos. Títulos longos do Fitland ajustados em 430 px.
- Resposta de contato do chat resumida, evitando a leitura de todo o novo footer.
- Footer existente incluído, com CTA, logo, WhatsApp, número, mensagem comercial e ano dinâmico preservados.

## Resultados

- Build Babel concluído; JavaScript compilado passou em `node --check`.
- 9 testes unittest aprovados, incluindo as cinco páginas, títulos, metadados, assets, logo, WhatsApp e serialização segura.
- `tests/footer-links.cjs` aprovado: links home/projeto e codificação de mensagens padrão e personalizadas.
- Cinco páginas em 320, 375, 390, 430, 768, 1024, 1440 e 1920 px: sem overflow horizontal, imagens quebradas ou violações automáticas de axe-core 4.14.0. Dois títulos apertados no Fitland foram corrigidos e revalidados em 430 px.
- Axe configurado com WCAG 2 A/AA, 2.1 AA, 2.2 AA e boas práticas. Gradientes geram verificações de contraste incompletas; o resultado automático não certifica conformidade integral.
- Pares de cores principais calculados pela fórmula de luminância: texto secundário/fundo escuro 8,03:1; roxo/fundo escuro 5,20:1; texto do CTA/dourado 10,12:1; placeholder/campo 9,61:1; borda/campo 4,93:1; foco/fundo 11,72:1. Valores de referência da paleta, não auditoria pixel a pixel de todos os gradientes.
- Tab, Shift+Tab, Escape, menu, chat, atalho de conteúdo, links de projeto, retorno e histórico verificados.
- Formulário vazio, obrigatório, espaços em branco e mensagem válida verificados sem enviar mensagens. Link gerado com o número correto e conteúdo codificado.
- Reflow adicional em 720 e 360 px nas cinco páginas passou, equivalente à largura de layout de 1440 px com zoom de 200%/400%. O atalho de zoom do navegador interno não mudou a escala: zoom nativo real permanece não verificado.
- Console final limpo nas cinco páginas, após remover toda instrumentação temporária de QA. Um conflito entre execuções simultâneas do axe ocorreu apenas no harness temporário; o harness foi removido.
- Comparação com produção: redesign e Fitland publicados, footer premium e ajustes desta rodada ainda locais. Produção tinha descrições de cards em 12 px, navegação em 12 px e campos em 11 px.
- Lighthouse não estava disponível no ambiente. Não foram inventadas notas.

## Evidências locais

Capturas e relatórios em `qa/artifacts/`, ignorados pelo Git: `ux-matrix.json`, `ux-fitland-final-430.json`, `ux-final-pages.json`, `ux-published-before.png`, `ux-full-desktop.png`, `ux-footer-desktop-after.png`, `ux-full-mobile.png`, `ux-footer-mobile-after.png`. A imagem integral de produção permite comparar a tipografia anterior; o footer local anterior está em `footer-desktop.jpg` e `footer-mobile.jpg`.

## Git e publicação

Alterações revisadas e preparadas para um único commit, incluindo o footer pendente. Nenhuma credencial, log, captura ou biblioteca temporária de auditoria faz parte das alterações. Sem commit, push, deploy ou alteração de configuração de produção nesta rodada. Implementação pronta para autorização de publicação, com as limitações de auditoria e zoom descritas acima.
