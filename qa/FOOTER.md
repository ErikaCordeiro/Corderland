# Footer premium — validação local

Implementado em 21/10/2026, seguindo a referência enviada. Sem commit, push ou deploy.

## Alterações

- Footer com CTA superior, decoração orbital leve em SVG/CSS, três colunas
  (marca, Explorar e Contato), copyright dinâmico e retorno ao topo.
- Logo transparente existente reutilizada sem alterações no arquivo ou nas
  logos dos projetos. Não há imagem de referência pesada carregada no site.
- WhatsApp comercial mantido em `data/site.json`, com a mensagem padrão:
  “Olá! Conheci a Coderland pelo site e gostaria de conversar sobre um projeto.”
- Helper `whatsappHref` reutilizado pelos CTAs comerciais. A mensagem específica
  do formulário continua sendo preservada, incluindo acentos, pontuação e quebras de linha.
- CTA e card inteiramente clicável abrem em nova aba com `noopener noreferrer`.
- Links do footer usam âncoras da home nas páginas individuais. O retorno ao topo
  usa `#inicio` da própria página.
- Chat mantém a lógica de respostas, abertura, fechamento e foco. Estilos ajustados
  para botão circular, margens e painel adaptável, com área livre no fim do footer.
- Formulário existente preservado. Nenhuma mensagem real foi enviada.

## Arquivos

- `static/js/app.js`: Footer, FooterOrbit, WhatsAppIcon e helper de WhatsApp.
- `static/js/app.min.js`: build atualizado.
- `static/css/footer.css`: estilos específicos e ajustes do chat.
- `templates/index.html`: carregamento do CSS do footer.
- `data/site.json`: mensagem comercial centralizada.
- `tests/test_site.py`: configuração de contato e disponibilidade do CSS.
- `tests/footer-links.cjs`: codificação dos links e âncoras de home/projetos.
- Este relatório e capturas locais em `qa/artifacts/` (capturas ignoradas no Git).

## Testes executados

- `node scripts/build.cjs`: aprovado.
- `node --check static/js/app.min.js`: aprovado.
- `python -m unittest discover -s tests -v`: nove testes aprovados.
- `node tests/footer-links.cjs`: aprovado. Mensagem padrão, mensagem específica
  com caracteres especiais e âncoras de home/página individual verificadas.
- `git diff --check`: aprovado.
- Navegador: home e quatro páginas de projetos em 320, 375, 390, 430, 768,
  1024, 1440 e 1920 px (40 combinações). Sem overflow horizontal nem recorte
  nos títulos, marca, links e textos do footer verificados.
- Logo do footer carregada; número, mensagem, target e rel dos links WhatsApp
  conferidos. O link externo não foi aberto nem enviado durante os testes.
- “Explorar → Projetos” testado a partir de página individual e direcionando
  corretamente à home. “Voltar ao topo” preserva a rota da página individual.
- Formulário testado localmente com mensagem de validação, somente até preparar
  o link. Mensagem específica corretamente preservada.
- Chat: resposta sobre Fluxonland, fechamento por Escape e foco no botão.
  Painel aberto sem overflow e com margens de pelo menos 16 px nas oito larguras.
  Botão fechado sem sobreposição aos links do footer nas oito larguras.
- Foco visível e nomes acessíveis presentes; decoração ignorada por leitores de tela.
  Regras de movimento reduzido preservadas, sem alterar a preferência do sistema.
- Console: nenhum erro ou aviso nas páginas verificadas.
- Capturas desktop e mobile revisadas visualmente contra a referência.

## Limites

- Não foi executado Lighthouse nem auditoria automatizada completa de WCAG.
- Sem novas dependências. Nenhum envio de WhatsApp e nenhuma publicação.
- A versão local está disponível em `http://127.0.0.1:5000/#rodape`.
