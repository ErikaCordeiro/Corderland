# Validação local — redesign Coderland

## Implementação

- Flask + React preservados, com conteúdo carregado de `data/site.json`.
- Logo original em CSS e escopo dos seis serviços preservados.
- Header sticky, navegação ativa, menu mobile, foco visível, Escape e link para pular conteúdo.
- Hero, soluções, auditorias, portfólio, método, contato e rodapé reformulados.
- Páginas individuais dos três projetos; ilustrações conceituais identificadas.
- Formulário com validação e preparação de link WhatsApp, sem envio automático.
- Chat local preservado, com foco, Escape e log de mensagens acessível.
- Metadados por página, Open Graph, canonical e conteúdo alternativo sem JavaScript.
- Animações CSS e IntersectionObserver; regra para `prefers-reduced-motion`.

## Verificações realizadas

- Build JSX por `node scripts/build.cjs`: aprovado.
- Sintaxe do JavaScript compilado por `node --check`: aprovada.
- `python -m unittest discover -s tests -v`: cinco testes aprovados.
- Testes de `/`, `/health`, `/api/site`, três rotas de projetos e 404 para projeto inexistente.
- Assets CSS/JS respondendo HTTP 200 e serialização segura dos dados na página.
- Navegador local: home e três páginas de projetos nas larguras 320, 375, 390,
  430, 768, 1024, 1440 e 1920 px (32 combinações).
- Nessas combinações: nenhum overflow horizontal; títulos, CTAs, formulário e
  cards verificados sem recorte; um H1 por página; nenhum campo sem rótulo;
  nenhum link de âncora com destino inexistente.
- Revisão visual em desktop e mobile: hero, soluções, auditorias, projetos,
  método e contato. Inspeção adicional da página Lua Active em mobile.
- Menu: abertura/fechamento, navegação, fechamento após seleção, foco no primeiro
  link e Escape devolvendo o foco ao botão.
- Formulário: campos obrigatórios, preparação de URL com texto codificado e feedback.
  Nenhuma mensagem foi enviada nem o link preparado foi aberto durante o teste.
- Chat: consulta Fluxonland, resposta correspondente ao cadastro, fallback para
  pergunta desconhecida e fechamento por Escape.
- Console: nenhum erro ou aviso novo no redesign. O histórico da aba continha
  um aviso anterior de Babel no navegador; esse recurso deixou de ser carregado.
- Recursos JS ativos: 172.549 bytes contra 4.363.342 bytes dos três vendors
  originais, antes mesmo de contar o JSX original. Removida compilação em runtime.
- Todos os assets ativos são locais. Não foram adicionadas fontes ou imagens remotas.

## Limites e publicação

- Não foi executado Lighthouse nem auditoria automatizada completa de WCAG.
  Não há pontuação de performance ou certificação de acessibilidade declarada.
- A regra de redução de movimento foi revisada no CSS; a preferência do sistema
  não foi alterada no teste de navegador.
- Não há lint configurado no projeto; o compilador JSX, a checagem de sintaxe,
  os testes Flask e a inspeção de navegador foram usados para validação.
- O site de produção não respondeu à ferramenta de leitura externa. A referência
  de conteúdo e funcionalidades foi o repositório clonado.
- Não existem imagens reais de projetos no repositório; as ilustrações não alegam
  representar telas, resultados, clientes ou integrações específicas.
- Alterações locais, sem commit, push ou deploy. O servidor de teste permanece
  disponível em `http://127.0.0.1:5000/` para aprovação visual.
- Capturas e medições locais em `qa/artifacts/` são ignoradas pelo Git.
