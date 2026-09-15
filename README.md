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

## Variantes Android

O projeto usa `App/app.config.ts` para manter o Preview e o Development instalados lado a lado. O `app.json` continua sendo a configuração estática principal; a camada dinâmica altera apenas a identidade necessária para cada variante.

| Variante | Perfil EAS | Nome no Android | Package | Scheme |
| --- | --- | --- | --- | --- |
| Preview | `preview` | `Luvia` | `com.joaopedro.luvia` | `luvia` |
| Development | `development` | `Luvia Dev` | `com.joaopedro.luvia.dev` | `luvia-dev` |
| Produção | `production` | `Luvia` | `com.joaopedro.luvia` | `luvia` |

Cada perfil define `APP_VARIANT` no `eas.json`. Se a variável estiver ausente ou tiver um valor desconhecido, a configuração usa a identidade oficial do Luvia como fallback seguro. O slug e o `projectId` EAS são compartilhados pelas variantes.

## Build Android interno — APK preview

O perfil `preview` do EAS gera um APK de distribuição interna, instalável diretamente em dispositivos Android. Esse build inclui o bundle do App e não depende do Expo Go nem de `npx expo start` para funcionar.

### Pré-requisitos

- Conta Expo com acesso ao projeto EAS vinculado ao Luvia.
- Acesso ao painel do projeto para conferir o ambiente `preview`.
- Android com permissão para instalar aplicativos de fontes externas ou `adb` configurado no computador.

Antes de iniciar o build, configure e confirme no ambiente EAS `preview`, sem registrar os valores no repositório:

| Variável | Finalidade |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | URL HTTPS pública da API online no Render |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Client ID web usado pelo Google Login nativo |

O arquivo local `App/.env` é ignorado pelo Git e não deve ser usado como garantia para o build remoto. As variáveis do ambiente EAS `preview` são incorporadas ao bundle durante o build. O perfil também define `APP_VARIANT=preview`, preservando o nome, o package e o scheme oficiais.

### Gerar o APK

Depois de confirmar as duas variáveis no EAS, execute os comandos abaixo a partir da raiz do repositório. O primeiro comando entra em `App/`, onde estão `eas.json` e `app.json`:

```powershell
cd App
npx --yes eas-cli@20.1.0 whoami
npx --yes eas-cli@20.1.0 project:info
npx --yes eas-cli@20.1.0 build --platform android --profile preview --clear-cache
```

O perfil `preview` está configurado com distribuição interna e `android.buildType` igual a `apk`. Não use o perfil `production` nesta etapa, pois ele é destinado ao fluxo de publicação.

### Instalar no Android

Ao concluir o build, abra no celular o link ou QR code fornecido pelo EAS, baixe o APK e autorize a instalação quando solicitado.

Como alternativa, baixe o APK no computador, conecte o dispositivo com a depuração USB habilitada e execute:

```powershell
adb install -r caminho\Luvia-preview.apk
```

O Preview pode permanecer instalado ao lado do Development porque os packages são diferentes. Se o Android recusar a atualização de uma instalação anterior do próprio Preview por incompatibilidade de assinatura, será necessário removê-la antes de instalar o novo APK; essa remoção apaga os dados locais dessa variante.

### Checklist pós-build

- Abrir o Luvia pelo ícone com Expo Go e Metro fechados.
- Confirmar que o App não solicita endereço de servidor de desenvolvimento.
- Testar cadastro, login, sessão salva, reconexão e logout usando a API online.
- Fechar e reabrir o App para validar a persistência da sessão.
- Percorrer as cinco abas e confirmar o acesso às rotas privadas.
- Testar o Google Login separadamente e validar a configuração do certificado Android caso ele falhe.
- Repetir um teste fora da rede local usada no desenvolvimento para confirmar que o APK não utiliza endereço local.

## Development build Android

O perfil `development` do EAS gera o aplicativo `Luvia Dev`, com package `com.joaopedro.luvia.dev`, como APK instalável com o `expo-dev-client`. Diferentemente do APK `preview`, esse aplicativo depende do Metro durante o desenvolvimento e deve ser aberto pelo próprio ícone, não pelo Expo Go.

### Variáveis de ambiente

Antes do build, configure e confirme no ambiente EAS `development`, sem registrar valores no repositório:

| Variável | Finalidade |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | URL HTTPS pública da API online no Render |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Client ID web usado pelo Google Login nativo |

O perfil `development` seleciona explicitamente esse ambiente do EAS. Entretanto, quando o JavaScript é carregado pelo Metro, as variáveis vêm do ambiente local. Por isso, confirme também que o arquivo ignorado `App/.env` contém os mesmos nomes e que `EXPO_PUBLIC_API_URL` aponta para a API online. Variáveis com prefixo `EXPO_PUBLIC_` fazem parte do bundle cliente e não devem conter segredos.

### Gerar e instalar

A partir da raiz do repositório, execute:

```powershell
cd App
npx --yes eas-cli@20.1.0 whoami
npx --yes eas-cli@20.1.0 project:info
npx --yes eas-cli@20.1.0 env:list --environment development
npx --yes eas-cli@20.1.0 build --platform android --profile development --clear-cache
```

Ao concluir, instale o APK pelo link ou QR code fornecido pelo EAS. Como alternativa:

```powershell
adb install -r caminho\Luvia-development.apk
```

O Development e o Preview usam packages diferentes e podem permanecer instalados simultaneamente. Cada variante mantém seus próprios dados locais e sua própria sessão.

### Executar com Metro

Com o development build instalado, execute a partir da raiz do repositório. A variável local é necessária para o Metro resolver a identidade `Luvia Dev` e o scheme `luvia-dev`:

```powershell
cd App
$env:APP_VARIANT = "development"
npx expo start --dev-client --clear
```

Abra o `Luvia Dev` instalado e conecte-o ao servidor exibido pelo Metro. O computador e o Android precisam conseguir se comunicar pela rede local; se a LAN ou o firewall impedir a conexão, use tunnel como alternativa. Ao encerrar a sessão de desenvolvimento, remova a variável do terminal:

```powershell
Remove-Item Env:APP_VARIANT -ErrorAction SilentlyContinue
```

Alterações somente em JavaScript ou TypeScript usam Fast Refresh e não exigem outro APK. Sempre gere um novo development build após adicionar, remover ou reconfigurar dependências nativas, plugins do Expo ou futuros módulos BLE.

### Google Sign-In e deep links

O Google Cloud precisa ter um OAuth Client ID Android específico para o package `com.joaopedro.luvia.dev` e para o SHA-1 da credencial usada pelo development build. O App e a API continuam usando o mesmo Web Client ID nas variáveis `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` e `GOOGLE_WEB_CLIENT_ID`; o Client ID Android não deve ser colocado no código. Se essa combinação de package e SHA-1 não estiver autorizada, o Google Sign-In pode falhar com `DEVELOPER_ERROR`.

Os links enviados atualmente pela API usam `luvia://` e abrem o Preview. O Development registra `luvia-dev://`; por isso, a recuperação de senha via deep link no `Luvia Dev` não é suportada nesta etapa. Essa é uma limitação conhecida e não altera o fluxo do Preview.

### Checklist do development build

- Confirmar que o Luvia abre pelo próprio ícone e não pelo Expo Go.
- Confirmar que o bundle é carregado pelo Metro e que o Fast Refresh funciona.
- Confirmar que `Luvia` e `Luvia Dev` aparecem simultaneamente no launcher.
- Testar cadastro, login, sessão e chamadas à API online.
- Testar o Google Login; se houver falha de credencial, validar o package e o SHA-1 usados pelo EAS.
- Confirmar que `luvia://` abre o Preview e `luvia-dev://` abre o Development.
- Registrar a recuperação de senha por deep link no Development como não suportada nesta etapa.
- Encerrar o Metro e confirmar que a indisponibilidade do servidor de desenvolvimento é informada, comportamento esperado desse tipo de build.

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
