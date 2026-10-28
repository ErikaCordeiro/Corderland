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


## Alternativa preservada — Resend HTTPS

A rota alternativa preservada `POST /api/contact` envia a mensagem para `https://api.resend.com/emails` por HTTPS (porta 443), sem SMTP e sem dependência adicional. O remetente vem de RESEND_FROM_EMAIL; o destinatário oficial é coderland.software@gmail.com. O e-mail validado do visitante é usado apenas em reply_to. Não há persistência local de mensagens nem dados pessoais ou respostas do provedor nos logs.

Em Render > serviço Corderland > Environment, configurar:

| Variável | Valor |
| --- | --- |
| CONTACT_TO_EMAIL | coderland.software@gmail.com |
| RESEND_API_KEY | Chave privada com permissão de envio, inserida somente no painel |
| RESEND_FROM_EMAIL | Endereço no domínio próprio verificado no Resend, ainda a definir |
| CONTACT_TOKEN_SECRET | Segredo aleatório estável de ao menos 32 bytes, compartilhado entre workers |

`.env.example` é um modelo; Flask não o carrega automaticamente. As antigas variáveis SMTP não são mais utilizadas. Nenhuma senha ou chave real consta no código ou no modelo. Arquivos .env privados são ignorados pelo Git.

### Ativação pendente

Não foi informado um domínio próprio controlado pela Coderland. Verificar no Resend o domínio/subdomínio que será usado no endereço RESEND_FROM_EMAIL, publicando os registros DNS exigidos pelo painel. gmail.com não é domínio próprio da Coderland e não pode servir como domínio remetente verificado. Não há remetente de teste ou fictício como fallback; ausência de configuração retorna erro seguro, sem chamada à API.

Depois de verificar o domínio: definir o remetente autorizado, inserir a chave e o segredo privadamente no Render e autorizar publicação e um teste real. Nenhum domínio foi cadastrado, DNS alterado ou e-mail real enviado nesta etapa. A API deve confirmar o domínio remetente na ativação; a validação sintática local não comprova posse de domínio.

Render Free bloqueia portas SMTP, mas esta integração usa HTTPS 443 e é compatível com essa restrição. Não é necessário alterar o plano para esse transporte. A conectividade real e as credenciais ainda não foram testadas. Resend aplica cotas, rate limits e requisitos de domínio/chave.

### Confirmação e segurança

Sucesso exige resposta HTTP 2xx com JSON contendo um id de e-mail não vazio e sem erro. Autenticação recusada, rejeição, limite do provedor, timeout, resposta inválida e indisponibilidade retornam 503 genérico. A URL é fixa e redirecionamentos não são seguidos, evitando repasse de chave e dados. Certificados TLS são validados. Timeout de 12 segundos; sem retries automáticos.

Aceitação pela API não garante entrega na caixa de entrada. Um timeout após aceitação pode deixar o resultado indeterminado; sem webhooks e sem idempotência entre novas tentativas, não há garantia de exatamente uma entrega.

As proteções existentes permanecem: token assinado (uma hora, uso único, intervalo mínimo de dois segundos), origem, JSON, honeypot, limites de tamanho, prevenção de injeção de cabeçalhos e cinco tentativas por IP em dez minutos. O frontend bloqueia duplicação durante o envio e conserva valores em falhas. WhatsApp comercial preservado.

CONTACT_TOKEN_SECRET deve ser estável. Rate limiting e tokens consumidos ficam em memória por processo; antes de múltiplos workers/instâncias, usar armazenamento compartilhado e revisar confiança no proxy para IPs reais. Não confiar em X-Forwarded-For arbitrário.

Testes: `.venv\Scripts\python.exe -m unittest discover -s tests -v`. Transporte HTTPS sempre mockado nos testes; nenhum e-mail real. Build: `node scripts/build.cjs`; sintaxe: `node --check static/js/app.min.js`; links: `node tests/footer-links.cjs`.

Referências: [API oficial Resend](https://resend.com/docs/api-reference/emails/send-email), [domínios verificados](https://resend.com/docs/dashboard/domains/introduction), [restrições Render Free](https://render.com/docs/free#other-limitations).


## Formulário ativo: Web3Forms direto pelo navegador

O formulário agora envia JSON a https://api.web3forms.com/submit, com a Access Key pública fornecida pela responsável. A chave identifica o formulário e o destinatário configurado na conta Web3Forms (coderland.software@gmail.com); não é senha nem chave privada. Nenhum e-mail destinatário ou segredo Resend é inserido no payload. Não é necessária variável Render, SMTP ou domínio próprio para esse fluxo.

Campos: name, email, replyto, phone opcional, company opcional, project, message e botcheck (checkbox oculto). Assunto: Novo contato — Coderland. As validações HTML e limites existentes permanecem. Há bloqueio local do honeypot e antispam do provedor. Honeypot é uma proteção limitada/depreciada segundo a documentação atual; não equivale a CAPTCHA. Nenhum CAPTCHA visual foi adicionado para preservar o layout solicitado. O rate limiting Flask protege apenas a rota Flask legada, não a chamada direta ao Web3Forms; o fluxo direto depende dos controles/cotas do provedor, além do bloqueio de duplicação da UI.

Sucesso requer HTTP 2xx e JSON com success estritamente true. Timeout total de 15 segundos, sem retry automático; erros mantêm os campos e exibem o texto de erro existente. Durante envio o botão fica desabilitado e aria-busy é atualizado. Sucesso significa confirmação da API, não garantia de entrega à caixa de entrada. Dados são processados pelo Web3Forms; revisar a política do provedor antes da publicação. Chave pública pode ser copiada; restrições adicionais dependem dos recursos do plano contratado.

Resend e /api/contact permanecem intactos como alternativa; a UI não faz fallback automático para evitar duplicações e transmissão inesperada. Variáveis RESEND_API_KEY, RESEND_FROM_EMAIL, CONTACT_TO_EMAIL e CONTACT_TOKEN_SECRET só são necessárias se a alternativa Flask for usada. Não remover essa alternativa até teste real autorizado confirmar Web3Forms.

Testes novos, sem rede: node tests/web3forms.cjs (inclui o handler real do componente compilado). O teste real único autorizado retornou HTTP 200 e success=true; a responsável confirmou recebimento no Gmail. Novos testes usam apenas mocks, sem repetir o envio real. Publicação autorizada pela responsável; acompanhar o commit no Render e verificar os assets publicados.

Documentação: https://docs.web3forms.com/how-to-guides/js-frameworks/react-js/simple-react-contact-form e https://docs.web3forms.com/getting-started/customizations/spam-protection.
