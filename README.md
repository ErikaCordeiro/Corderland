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

