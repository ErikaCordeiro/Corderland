# Coderland

Site institucional da Coderland (Flask + React).

## Rodar localmente (Windows / PowerShell)

1. Instalar dependencias:

```powershell
pip install -r requirements.txt
```

2. Rodar o servidor:

```powershell
python app.py
```

Abra `http://127.0.0.1:5000/`.

## Desenvolvimento do redesign

O backend Flask, `/api/site` e o conteúdo em `data/site.json` foram preservados.
O React 18.3.1 é servido localmente em versão de produção. Não há dependência de CDN no navegador.

Após editar `static/js/app.js`, compile o JSX antes de atualizar a página:

```powershell
node scripts/build.cjs
node --check static/js/app.min.js
python -m unittest discover -s tests -v
```

Também estão disponíveis `npm run build` e `npm run check`, sem instalação de pacotes npm.
O compilador usa o Babel já incluído em `static/vendor`. O arquivo compilado
`static/js/app.min.js` deve acompanhar as alterações de fonte no Git; o Render
continua usando o fluxo Python existente, sem exigir Node em produção.

Páginas individuais: `/projetos/fluxonland`, `/projetos/hey-dev` e
`/projetos/lua-active`. As composições gráficas são conceituais e identificadas.
Não há telas reais ou tecnologias verificadas dos produtos no material original.

O formulário prepara uma mensagem para o WhatsApp já cadastrado. O visitante
revisa e envia na conversa; não há persistência, envio automático, CRM ou e-mail.
O chat local de consulta ao conteúdo foi preservado.

Resultados e limites da verificação: `qa/VALIDACAO.md`.

## Conteudo do site (sem banco)

Este projeto nao usa banco de dados por enquanto. O conteudo principal fica em:

`data/site.json`

Para adicionar/editar projetos, servicos, textos e WhatsApp, edite esse arquivo. O frontend busca os dados em:

`GET /api/site`

## Deploy (Render)

O deploy no Render esta configurado via `render.yaml` e roda com:

`gunicorn app:app`

Rotas uteis para verificar:

- `GET /health`
- `GET /api/site`

