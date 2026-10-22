# Fitland — integração no portfólio

Verificação em 21/10/2026. Alterações apenas na Coderland, sem commit, push ou deploy.

## Conteúdo e referências

- Aplicação inspecionada: https://fitland.up.railway.app, com sessão existente.
- Código consultado, somente leitura: `C:/Users/pc/Documents/Personal/official-checkout`.
- Não foram cadastrados alunos, editados treinos, alteradas configurações,
  enviados formulários ou realizadas mudanças de autenticação no Fitland.
- Fluxonland, Hey Dev e Lua Active mantêm seus cadastros e apresentações.

| Funcionalidade apresentada | Evidência |
| --- | --- |
| Gestão de alunos | `frontend/src/pages/Students.jsx`, `StudentForm.jsx`; `backend/app/api/routes/students.py` e serviços correspondentes: listagem, criação e edição. |
| Planejamento de treinos | `frontend/src/pages/WorkoutBuilder.jsx`, chamadas em `App.jsx`; `backend/app/api/routes/workouts.py`: listagem, criação e edição. |
| Acompanhamento de atividades | `WorkoutExecution.jsx`: séries, cargas, repetições e persistência; `backend/app/api/routes/workout_sessions.py`: sessão e histórico. |
| Calendário | `StudentCalendar.jsx` → `AgendaModule.jsx`; `backend/app/api/routes/agenda.py`: consulta por período, treinos e compromissos. |
| Adaptação mobile | Regras responsivas no código e inspeção do dashboard publicado em viewport mobile. |
| Painéis | Dashboard publicado efetivamente carregado; componentes de dashboard no código. |

Os fluxos de cadastro, edição e execução foram confirmados no código, não
exercitados em produção, para preservar os dados. A disponibilidade por usuário
depende do perfil e dos módulos habilitados. Nenhuma função em protótipo foi
promovida no portfólio.

Tecnologias verificadas em `frontend/package.json`, `backend/requirements.txt`,
configuração de banco e Dockerfile: React, Vite, JavaScript, CSS, Python,
FastAPI, SQLAlchemy e PostgreSQL. Não foram inferidas versões de produção.

## Visual utilizado

- `static/images/fitland/painel-atividade-mobile.jpg`: recorte real do painel
  “Atividade da plataforma” na versão mobile, capturado em 21/10/2026.
- A captura mostra o estado real sem dados disponíveis. Não contém nomes,
  contatos, números operacionais ou registros de alunos. Nenhum dado foi
  substituído ou fabricado. Foram feitos apenas recorte e compressão JPEG.
- O smartphone é uma moldura ilustrativa em CSS. A marca segue a composição
  roxa em CSS presente em `OwnerLayout.jsx` e `styles/global.css` do Fitland.
- A mesma captura aparece ampliável na galeria. Legendas distinguem o mockup
  da tela real. Não foram inventadas outras telas.

## Implementação

- Cadastro Fitland em `data/site.json`: conteúdo, funcionalidades, tecnologias,
  link oficial e informações da captura.
- Rota `/projetos/fitland` reutiliza Flask e o template existente, com metadados
  SEO, canonical e Open Graph próprios.
- `FitlandVisual`, `FitlandBrand` e `FitlandPage` reutilizam os componentes
  existentes, tokens de cor, formulário, cabeçalho e rodapé.
- Grade de quatro projetos em duas colunas no desktop e uma no mobile.
- Fitland incluído automaticamente no seletor de contato e na base do chat.
- `fitland.css` concentra os estilos específicos; nenhuma biblioteca adicionada.

## Resultado de testes

- Build `node scripts/build.cjs`: aprovado, JSX compilado para `app.min.js`.
- `node --check static/js/app.min.js`: aprovado.
- `python -m unittest discover -s tests -v`: sete testes aprovados.
- Nova rota acessada diretamente e após atualização no navegador.
- Rotas existentes de Fluxonland, Hey Dev e Lua Active conferidas no navegador.
- Home e Fitland em 320, 375, 390, 430, 1024, 1440 e 1920 px: 14 combinações
  sem overflow horizontal e sem recorte nos títulos, cards, formulário e CTAs
  verificados. Quatro cards, links corretos e imagens resolvidas.
- Menu mobile: abrir, navegar para Projetos e fechar após a seleção.
- Card Fitland abre a nova página; galeria aponta para imagem local válida;
  links para a aplicação oficial preservam o endereço informado.
- Console do navegador: nenhum erro ou aviso nas páginas verificadas.
- `git diff --check`: aprovado; não há lint configurado no projeto.

## Limites e pendências

- Não se afirma que todos os fluxos do código foram testados em produção.
- A galeria usa apenas o recorte real disponível sem dados pessoais.
- Sem alteração no Fitland ou no banco de dados. Sem publicação.
- Versão local pronta para revisão em http://127.0.0.1:5000/projetos/fitland.
- Evidências de navegador e capturas de revisão em `qa/artifacts/`, ignoradas no Git.
