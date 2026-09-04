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
| URL pública | `PUBLIC_API_URL`, `APP_DEEP_LINK_SCHEME` |
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

## Convenções do repositório

- Não versione arquivos `.env`, artefatos Expo, `node_modules`, uploads ou build da API.
- Não execute comandos npm na raiz: use `App/` ou `Api/`.
- Mantenha alterações de interface em `App/` e alterações de servidor/banco em `Api/`.
