# Luvia

O Luvia é uma plataforma de apoio à comunicação em Libras. Este repositório contém o aplicativo mobile e a API que sustentam a versão atual do projeto.

## Estrutura

```text
App/  Aplicativo mobile em React Native e Expo
Api/  API em Node.js, Express, Prisma e PostgreSQL/Neon
```

Use sempre os diretórios `App/` e `Api/` como fontes oficiais. Não há projeto executável na raiz do repositório.

## Pré-requisitos

- Node.js e npm
- Uma instância PostgreSQL compatível com Prisma (Neon em ambiente remoto)
- Para Android/iOS, o ambiente Expo apropriado ao dispositivo ou emulador

## Variáveis de ambiente

Os arquivos de exemplo não contêm segredos. Copie cada um para o arquivo local correspondente e preencha os valores do ambiente:

```powershell
Copy-Item App/.env.example App/.env
Copy-Item Api/.env.example Api/.env
```

### App

| Variável | Finalidade |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | URL pública ou de desenvolvimento da API |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Client ID web usado pelo login nativo do Google |

### API

| Grupo | Variáveis |
| --- | --- |
| Banco | `DATABASE_URL` |
| Tokens | `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_TOKEN_DAYS` |
| Google | `GOOGLE_WEB_CLIENT_ID` |
| URL pública e CORS | `PUBLIC_API_URL`, `CORS_ORIGINS`, `APP_DEEP_LINK_SCHEME` |
| E-mail | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `APP_NAME` |
| Servidor | `PORT`, `NODE_ENV` |

## Rodar o App

```powershell
Set-Location App
npm ci
npm start
```

Comandos úteis:

```powershell
npm run android
npm run ios
npm run web
npm run lint
```

Para um dispositivo físico, `EXPO_PUBLIC_API_URL` deve apontar para uma URL alcançável pelo dispositivo; `localhost` e `10.0.2.2` são apropriados somente para cenários locais específicos.

## Rodar a API

```powershell
Set-Location Api
npm ci
npm run dev
```

A API usa a porta definida em `PORT`; se ausente, usa `3333`.

Comandos úteis:

```powershell
npm run build
npm start
npm run prisma:generate
```

Migrations e operações de banco devem ser executadas deliberadamente, em tarefa própria e com o ambiente correto configurado.

## Deploy da API no Render

Crie um **Web Service** com o diretório raiz `Api` e Node.js 22 LTS. Use as configurações abaixo:

| Configuração | Valor |
| --- | --- |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

O comando de build gera o Prisma Client e compila a API. O Render fornece `PORT` automaticamente; não a defina manualmente. Em produção, defina `NODE_ENV=production`, uma `DATABASE_URL` do Neon, um `JWT_SECRET` forte e `PUBLIC_API_URL` com a URL HTTPS pública do serviço, sem barra final.

Defina `CORS_ORIGINS` com as origens web permitidas, separadas por vírgula. Se ficar vazia em produção, nenhum navegador será liberado; clientes nativos e ferramentas sem header `Origin` continuam permitidos.

Não inclua migrations no build ou no start. Quando a base de produção precisar ser atualizada, execute `npx prisma migrate deploy` somente em uma tarefa autorizada, preferencialmente como Pre-Deploy Command em um plano Render que ofereça esse recurso.

Após o deploy, confirme `GET /health`, o login e a renovação de sessão, o CORS para uma origem permitida e outra bloqueada, e o acesso do App pela URL HTTPS pública.

## Convenções do repositório

- Não versione arquivos `.env`, artefatos Expo, `node_modules`, uploads ou build da API.
- Não execute comandos npm na raiz: use `App/` ou `Api/`.
- Mantenha alterações de interface em `App/` e alterações de servidor/banco em `Api/`.
