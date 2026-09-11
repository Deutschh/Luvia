# Planejamento Geral do Projeto Luvia

**Versao:** 1.0  
**Data:** 11/09/2026  
**Projeto:** Luvia - Tradutor de Libras com App, API e Luvas Inteligentes  
**Objetivo deste arquivo:** servir como guia central para as proximas etapas do desenvolvimento, evitando improviso e mantendo o Codex orientado por um plano claro.

---

## 1. Visao geral

O Luvia e um projeto de tecnologia assistiva para traducao de sinais de Libras em texto e voz, usando um App mobile, uma API online e, nas etapas futuras, luvas inteligentes com ESP32-S3, sensores de flexao, IMU e comunicacao Bluetooth/BLE.

A base inicial do projeto ja foi estabilizada. O foco agora e avancar com seguranca para funcionalidades reais, sem perder controle de versao, sem misturar escopos e sem implementar recursos grandes antes das preparacoes necessarias.

### Estado atual resumido

- Estrutura oficial do repositorio: `App/` e `Api/` na raiz.
- App em Expo/React Native com TypeScript e Expo Router.
- API Node/Express/Prisma usando Neon PostgreSQL.
- API publicada no Render.
- App apontando para a API online via `EXPO_PUBLIC_API_URL`.
- Autenticacao, sessao, rotas privadas e logout revisados.
- Visual mobile ajustado: Safe Area, teclado, cards e bottom navigation.
- Bottom navigation com 5 abas: Inicio, Dicionario, Traduzir, Luvas e Configuracoes.
- Tela Traduzir criada como placeholder.
- Tela Luvas organizada como aguardando conexao, sem dados ficticios.
- Validacao geral App + API online concluida no Android.
- Merge para `main` resolvido preservando a estrutura oficial.

### Distincao importante

A base tecnica esta estabilizada, mas o produto completo ainda nao esta finalizado.

Concluido neste bloco:

- App acessando API online.
- Autenticacao funcional.
- Navegacao protegida.
- Visual base profissional.
- Estrutura limpa do repositorio.
- Validador manual inicial aprovado.

Ainda futuro:

- Build Android instalavel sem Expo Go.
- BLE/Bluetooth real.
- Firmware ESP32-S3.
- Leitura real dos sensores.
- Calibracao real.
- Traducao real dos sinais.
- Voz/TTS funcional na tela Traduzir.
- Preparacao final para TCC/apresentacao.

---

## 2. Regras gerais de desenvolvimento

Estas regras devem ser mantidas em todas as proximas etapas, principalmente ao usar o Codex.

### 2.1 Fluxo padrao por etapa

1. Criar ou atualizar uma branch especifica.
2. Pedir ao Codex uma auditoria ou plano antes de alterar arquivos.
3. Aprovar explicitamente o plano.
4. Implementar somente os arquivos e objetivos aprovados.
5. Rodar validacoes tecnicas.
6. Testar no Android quando aplicavel.
7. Revisar `git diff`.
8. Fazer commit com mensagem clara.
9. Fazer push.
10. So entao avancar para a proxima etapa.

### 2.2 Regras para o Codex

Sempre que enviar um prompt para o Codex, manter estas restricoes quando aplicavel:

- Nao alterar arquivos antes de apresentar plano, salvo quando a etapa ja for de implementacao aprovada.
- Nao instalar pacotes sem justificar.
- Nao rodar migrations sem autorizacao.
- Nao alterar `.env` real.
- Nao expor segredos, tokens, URLs sensiveis ou credenciais.
- Nao criar commit automaticamente, a menos que seja pedido.
- Nao misturar BLE, IoT, API, visual e autenticacao na mesma tarefa sem necessidade.
- Sempre informar arquivos alterados e comandos de teste.

### 2.3 Nomenclatura de branches

Padrao recomendado:

- `fix/...` para correcao pequena.
- `feature/...` para funcionalidade nova.
- `chore/...` para organizacao, build, configuracao ou infraestrutura.
- `docs/...` para documentacao.
- `iot/...` para firmware/protocolo/ESP32.

Exemplos:

- `fix/app-register-api-errors`
- `fix/app-session-network`
- `chore/android-preview-build`
- `feature/ble-protocol-contract`
- `iot/esp32-ble-prototype`

### 2.4 Definicao de concluido por etapa

Uma etapa so deve ser considerada concluida quando houver:

- Escopo cumprido.
- TypeScript sem erros, quando aplicavel.
- `git diff --check` aprovado.
- Teste manual minimo concluido.
- Nenhum arquivo fora do escopo alterado sem justificativa.
- Commit criado.
- Push realizado.
- Observacoes registradas para pendencias futuras.

---

## 3. Etapas ja concluidas

### Etapa 0 - Organizacao e limpeza do projeto

**Status:** concluida.

Objetivo: estabilizar a estrutura do repositorio e remover residuos antigos.

Resultado:

- Estrutura oficial definida como `App/` e `Api/` na raiz.
- Pastas antigas e arquivos residuais removidos ou deixados fora do fluxo principal.
- `.gitignore`, `.env.example` e README revisados.
- Projeto ficou mais facil de abrir, testar e manter.

### Etapa 1 - Sessao e protecao de rotas no App

**Status:** concluida.

Objetivo: consolidar autenticacao no App e impedir acesso indevido a telas privadas.

Resultado:

- Guard central de rotas.
- Rotas publicas e privadas separadas.
- Login direcionando corretamente para Home.
- Logout limpando sessao.
- Refresh token tratado de forma mais segura.
- Cadastro indo direto para Home enquanto verificacao real nao existe.

### Etapa 2 - Seguranca da autenticacao na API

**Status:** concluida.

Objetivo: corrigir inconsistencias e reforcar seguranca da API.

Resultado:

- Senha minima de 8 caracteres na API.
- Rotas sensiveis ajustadas.
- Reset/alteracao de senha revogando refresh tokens.
- Recuperacao de senha com resposta generica.
- Logs sem expor dados sensiveis.
- Refresh token mais seguro.
- CORS por ambiente.
- `/health` simples para Render.

### Etapa 3 - Deploy da API no Render

**Status:** concluida.

Objetivo: deixar a API online para o App usar fora do ambiente local.

Resultado:

- API publicada no Render.
- `GET /health` respondendo `200`.
- App configurado para usar URL HTTPS da API.
- Base pronta para testes reais no celular.

### Etapa 4 - Refinamento visual, Safe Area, cards e bottom navigation

**Status:** concluida.

Objetivo: melhorar usabilidade mobile e corrigir problemas visuais no Android.

Resultado:

- Safe Area ajustada.
- Teclado nao cobrindo inputs principais.
- Bug dos cards com retangulos brancos resolvido.
- Bottom navigation redesenhada com 5 abas.
- Tela `Traduzir` criada como placeholder.

### Etapa 5 - Organizacao das abas

**Status:** concluida.

Objetivo: separar melhor a responsabilidade de cada tela.

Resultado:

- Aba Luvas focada em hardware/conexao/sensores.
- Controles de voz removidos da aba Luvas.
- Controles de voz concentrados em Personalizar Voz.
- Configuracoes ganhou acesso direto a Notificacoes.
- Luvas passou a exibir estado honesto de aguardando conexao, sem bateria/precisao ficticias.

### Etapa 6 - Validacao geral App + API online

**Status:** concluida.

Objetivo: validar os principais fluxos no Android usando a API online.

Resultado:

- Ambiente validado.
- `/health` online.
- Rotas protegidas retornando `401` sem token.
- Cadastro, login, sessao e navegacao testados no Android.
- Testes principais passaram.
- Recuperacao de senha ficou bloqueada por SMTP nao confirmado.
- Refresh de longo prazo ficou para validacao futura.
- Avatar ficou com ressalva sobre persistencia em Render.

---

## 4. Roadmap das proximas etapas

### Visao macro

As proximas etapas devem seguir esta ordem:

1. Etapa 7 - Fechamento tecnico e backlog controlado.
2. Etapa 8A - Ajustes pequenos de cadastro, erros e timeout.
3. Etapa 8B - Sessao, rede e refresh.
4. Etapa 8C - Preferencias e salvamento confiavel.
5. Etapa 9A - Build Android interno/APK preview.
6. Etapa 9B - Atualizacoes OTA/EAS Update, se fizer sentido.
7. Etapa 9C - Development build para recursos nativos/BLE.
8. Etapa 10 - Contrato BLE e protocolo das luvas.
9. Etapa 11 - Firmware ESP32-S3 inicial.
10. Etapa 12 - Integracao BLE real no App.
11. Etapa 13 - Calibracao real dos sensores.
12. Etapa 14 - Traducao MVP.
13. Etapa 15 - Preparacao para TCC/apresentacao.
14. Etapa 16 - Pos-TCC e evolucao do produto.

---

## 5. Etapa 7 - Fechamento tecnico e backlog controlado

**Status:** proxima etapa recomendada.  
**Tipo:** auditoria/organizacao.  
**Branch sugerida:** pode ser feita na `main` sem alteracao, ou em `docs/roadmap-luvia` caso este arquivo entre no repositorio.

### Objetivo

Criar um checkpoint oficial do estado atual e transformar pendencias conhecidas em backlog priorizado.

### Escopo

- Confirmar `main` atualizada com `origin/main`.
- Confirmar git limpo.
- Listar branches antigas e decidir quais manter ou remover.
- Registrar pendencias conhecidas.
- Separar bugs reais, melhorias, infraestrutura, BLE/IoT e TCC.
- Definir a proxima branch de implementacao.

### Pendencias conhecidas

Bugs/ajustes pequenos:

- App de cadastro ainda pode aceitar senha menor que a API exige.
- Mensagens de erro podem ser melhoradas em cadastro/login.
- Cliente HTTP ainda pode precisar de timeout melhor.
- Tratamento de resposta nao JSON pode ser melhorado.
- Falha de rede na inicializacao pode parecer logout.
- Refresh rejeitado precisa sincronizar melhor a UI.
- Preferencias podem salvar de forma otimista sem rollback adequado.

Funcionalidades incompletas:

- Detalhes reais de sinais no Dicionario.
- Favoritar/desfavoritar diretamente pelas telas.
- Notificacoes ainda demonstrativas.
- Home ainda com indicadores demonstrativos.
- Traduzir ainda placeholder.
- Luvas ainda placeholder.

Infraestrutura:

- Build Android instalavel.
- Configuracao de EAS Build.
- Possivel EAS Update.
- Persistencia de avatar fora do disco efemero do Render.
- SMTP para recuperacao de senha.

BLE/IoT:

- Contrato dos dados das luvas.
- Firmware ESP32-S3.
- BLE no App.
- Calibracao real.
- Traducao por regras ou modelo.

### Arquivos provaveis

- `README.md`
- `PLANEJAMENTO_LUVIA.md`, caso o planejamento entre no repositorio.
- Nenhum arquivo funcional deve ser alterado nesta etapa, salvo aprovacao.

### Validacao

- `git status`
- `git branch`
- `git log --oneline -5`
- Conferir se `main` esta atualizada.

### Definicao de concluido

- Backlog organizado.
- Branches revisadas.
- Proxima etapa escolhida.
- Nenhuma alteracao funcional feita.

---

## 6. Etapa 8A - Cadastro, erros de API e timeout

**Status:** futura.  
**Tipo:** correcao pequena.  
**Branch sugerida:** `fix/app-register-api-errors`.

### Objetivo

Corrigir inconsistencias simples entre App e API e melhorar a experiencia quando a API demora, falha ou retorna erro.

### Escopo recomendado

- Alinhar senha minima do cadastro no App para 8 caracteres.
- Melhorar mensagens de erro no cadastro.
- Melhorar mensagens de erro no login.
- Adicionar timeout controlado no cliente HTTP, se ainda nao existir.
- Tratar resposta nao JSON sem quebrar o App.
- Evitar loading infinito.

### Fora do escopo

- Nao alterar API, salvo se um bug real for comprovado nela.
- Nao alterar modelo de banco.
- Nao implementar recuperacao de senha.
- Nao mexer em BLE, voz ou dicionario.

### Arquivos provaveis

- `App/src/app/register.tsx`
- `App/src/app/login.tsx`
- `App/src/services/api.ts`
- Possivelmente componentes compartilhados de formulario, se existirem.

### Testes manuais

- Cadastro com senha de 6 caracteres.
- Cadastro com senha de 7 caracteres.
- Cadastro com senha de 8 caracteres.
- E-mail duplicado.
- Campos vazios.
- Login com senha incorreta.
- Login com conta inexistente.
- API offline ou rede desligada.

### Definicao de concluido

- App bloqueia senha menor que 8 antes de chamar API.
- Erros aparecem de forma clara.
- Botoes destravam apos falha.
- Sem loading permanente.
- TypeScript aprovado.
- Testes no Android aprovados.

---

## 7. Etapa 8B - Sessao, rede e refresh

**Status:** futura.  
**Tipo:** estabilidade.  
**Branch sugerida:** `fix/app-session-network`.

### Objetivo

Evitar confusao entre sessao invalida e falha temporaria de rede, alem de sincronizar melhor refresh recusado com a interface.

### Escopo recomendado

- Separar estado de rede indisponivel de logout real.
- Melhorar comportamento quando o App abre sem internet com sessao salva.
- Garantir que refresh recusado limpe tokens e atualize usuario em memoria.
- Evitar que tela privada permaneca aberta depois de sessao invalidada.
- Revisar volta do Android apos logout.

### Fora do escopo

- Nao alterar regras de seguranca da API sem necessidade.
- Nao reduzir validade de token em producao para testar.
- Nao implementar monitoramento complexo de rede se nao for necessario.

### Arquivos provaveis

- `App/src/contexts/AuthContext.tsx`
- `App/src/services/api.ts`
- `App/src/app/_layout.tsx`

### Testes manuais

- Login e fechamento do App.
- Reabrir com internet.
- Reabrir sem internet.
- Desligar rede durante carregamento.
- Logout e botao voltar do Android.
- Token invalido ou refresh recusado em ambiente de teste, se houver forma segura.

### Definicao de concluido

- App nao parece deslogar por falha temporaria de rede sem explicar.
- Refresh invalido encerra sessao visualmente.
- Rotas privadas continuam protegidas.
- UX de erro fica compreensivel.

---

## 8. Etapa 8C - Preferencias e salvamento confiavel

**Status:** futura.  
**Tipo:** estabilidade/UX.  
**Branch sugerida:** `fix/app-settings-persistence`.

### Objetivo

Garantir que configuracoes e personalizacao de voz nao confirmem salvamento quando a API falha.

### Escopo recomendado

- Revisar salvamento de switches em Configuracoes.
- Adicionar rollback visual se o salvamento falhar.
- Revisar volume, velocidade e voz em Personalizar Voz.
- Evitar duplicidade de chamadas durante alteracoes rapidas.
- Mensagem clara de sucesso/falha.

### Fora do escopo

- Nao implementar aplicacao global real de modo escuro, salvo decisao especifica.
- Nao implementar TTS real.
- Nao mexer na aba Luvas.

### Arquivos provaveis

- `App/src/app/settings.tsx`
- `App/src/app/voice.tsx`
- Services de usuario/configuracoes, se existirem.

### Testes manuais

- Salvar com rede ativa.
- Salvar sem rede.
- Trocar valores rapidamente.
- Fechar e reabrir App.
- Logar com outra conta e verificar isolamento.

### Definicao de concluido

- Preferencias salvas persistem.
- Falha de rede nao mostra sucesso falso.
- Valores voltam ao estado anterior em falha ou comunicam pendencia.

---

## 9. Etapa 9A - Build Android interno/APK preview

**Status:** futura.  
**Tipo:** infraestrutura/build.  
**Branch sugerida:** `chore/android-preview-build`.

### Objetivo

Gerar um APK instalavel para Android que funcione sem Expo Go e sem `npx expo start`, usando a API online do Render.

### Resultado esperado

O usuario instala o app no celular e abre pelo icone normalmente. O app se conecta a API online e permite usar os fluxos ja implementados sem depender do computador local.

### Escopo recomendado

- Revisar `App/eas.json`.
- Revisar `App/app.json`.
- Garantir perfil `preview` ou equivalente para Android APK interno.
- Confirmar uso da API online no build.
- Documentar comando de build.
- Documentar instalacao do APK.

### Fora do escopo

- Nao publicar na Google Play.
- Nao implementar BLE.
- Nao adicionar dependencias nativas ainda sem necessidade.
- Nao mudar branding final sem decisao.

### Arquivos provaveis

- `App/eas.json`
- `App/app.json`
- `README.md`, se for documentar.

### Validacao

- Gerar build via EAS.
- Instalar APK no Android.
- Abrir sem Expo Go.
- Testar login/cadastro/sessao/dicionario/configuracoes.
- Desligar o PC e confirmar que o app ainda abre e usa a API online.

### Definicao de concluido

- APK instalado e funcionando.
- App nao depende de Metro/local.
- API online usada corretamente.
- Instrucoes registradas.

---

## 10. Etapa 9B - EAS Update/atualizacoes OTA

**Status:** futura/opcional.  
**Tipo:** infraestrutura.  
**Branch sugerida:** `chore/eas-update-preview`.

### Objetivo

Permitir atualizacoes de JavaScript/estilo sem gerar novo APK toda vez, quando possivel.

### Quando faz sentido

Esta etapa faz sentido depois que o APK preview estiver funcionando. Ela ajuda em ajustes visuais, textos e logica JS. Mudancas nativas ainda exigem novo build.

### Escopo recomendado

- Configurar canais/branches de update.
- Documentar quando usar update e quando gerar novo build.
- Testar uma mudanca pequena de texto/visual.

### Fora do escopo

- Nao usar como substituto para build nativo quando houver BLE/permissoes nativas.
- Nao publicar em producao sem estrategia de canal.

### Arquivos provaveis

- `App/eas.json`
- `App/app.json`
- README ou documentacao de deploy.

### Definicao de concluido

- Canal de update documentado.
- Teste pequeno aplicado com sucesso.
- Limites entendidos.

---

## 11. Etapa 9C - Development build para BLE

**Status:** futura.  
**Tipo:** preparacao nativa.  
**Branch sugerida:** `chore/android-dev-build-ble-ready`.

### Objetivo

Preparar um development build adequado para integrar bibliotecas nativas, especialmente BLE/Bluetooth.

### Escopo recomendado

- Avaliar biblioteca BLE para React Native/Expo.
- Verificar requisitos de prebuild/config plugins.
- Configurar permissoes Android necessarias quando a biblioteca for escolhida.
- Gerar development build.
- Garantir que o App continua funcionando com API online.

### Fora do escopo

- Nao conectar ESP32 ainda.
- Nao implementar protocolo final ainda.
- Nao misturar firmware nesta etapa.

### Arquivos provaveis

- `App/package.json`
- `App/app.json`
- `App/eas.json`
- Arquivos nativos gerados somente se a estrategia exigir.

### Definicao de concluido

- Development build instalado.
- App abre e mantem funcionalidades atuais.
- Ambiente pronto para BLE.

---

## 12. Etapa 10 - Contrato BLE e protocolo das luvas

**Status:** futura.  
**Tipo:** arquitetura IoT.  
**Branch sugerida:** `feature/ble-protocol-contract` ou `docs/ble-protocol`.

### Objetivo

Definir o formato dos dados que as luvas enviarao para o App antes de implementar firmware e BLE real.

### Decisoes pendentes

- Uma ESP32 por luva ou uma placa central?
- BLE separado para esquerda/direita ou um dispositivo centralizado?
- Frequencia de envio dos dados.
- Campos minimos por pacote.
- Como identificar luva esquerda e direita.
- Como lidar com perda de conexao.
- Como representar bateria.
- Como salvar calibracao.

### Proposta inicial de pacote

Campos possiveis:

```json
{
  "deviceId": "luvia-left-001",
  "side": "left",
  "timestamp": 123456,
  "battery": 87,
  "flex": {
    "thumb": 0.12,
    "index": 0.48,
    "middle": 0.51,
    "ring": 0.33,
    "pinky": 0.20
  },
  "imu": {
    "accelX": 0.01,
    "accelY": -0.12,
    "accelZ": 0.98,
    "gyroX": 0.0,
    "gyroY": 0.0,
    "gyroZ": 0.0
  }
}
```

### Escopo recomendado

- Criar documento do protocolo.
- Definir nomes dos campos.
- Definir unidades e escala.
- Definir frequencia inicial.
- Definir estados de conexao.
- Definir modo simulado para testes.

### Fora do escopo

- Nao implementar BLE ainda.
- Nao implementar firmware ainda.
- Nao treinar IA ainda.

### Arquivos provaveis

- `docs/ble-protocol.md`
- Possivelmente tipos TypeScript futuros em `App/src/types`, se aprovado.

### Definicao de concluido

- Contrato de dados aprovado.
- Campos minimos definidos.
- Escopo da primeira integracao BLE claro.

---

## 13. Etapa 11 - Firmware ESP32-S3 inicial

**Status:** futura.  
**Tipo:** IoT/firmware.  
**Branch sugerida:** `iot/esp32-ble-prototype`.

### Objetivo

Criar o primeiro firmware da ESP32-S3 capaz de anunciar via BLE e enviar dados simulados ou basicos para o App.

### Escopo recomendado

Fase 1:

- ESP32 liga corretamente.
- Dispositivo aparece no scanner BLE.
- Servico BLE criado.
- Caracteristica BLE envia pacote simulado.
- Logs seriais ajudam no debug.

Fase 2:

- Ler sensores de flexao.
- Normalizar leituras basicas.
- Ler IMU, se o BNO055 ja estiver conectado.
- Enviar pacote real seguindo o contrato.

### Fora do escopo

- Nao traduzir Libras no firmware neste momento.
- Nao implementar IA local agora.
- Nao otimizar bateria antes do MVP funcionar.

### Arquivos provaveis

- Nova pasta possivel: `Firmware/` ou `Iot/`.
- Documentacao de pinagem.
- Codigo `.ino` ou PlatformIO, conforme decisao.

### Definicao de concluido

- ESP32 aparece via BLE.
- Envia dados basicos.
- Contrato inicial respeitado.
- Pinagem documentada.

---

## 14. Etapa 12 - Integracao BLE real no App

**Status:** futura.  
**Tipo:** funcionalidade App + nativo.  
**Branch sugerida:** `feature/app-ble-gloves`.

### Objetivo

Fazer o App encontrar, conectar e receber dados reais ou simulados da ESP32-S3.

### Escopo recomendado

- Scanner de dispositivos BLE.
- Conexao com luva esquerda/direita.
- Estado conectado/desconectado.
- Leitura de pacote BLE.
- Exibicao basica dos dados na aba Luvas.
- Tratamento de permissao Android.
- Reconnect simples.

### Fora do escopo

- Nao fazer traducao real ainda.
- Nao fazer calibracao completa ainda.
- Nao criar modelo de IA ainda.

### Arquivos provaveis

- `App/src/app/gloves.tsx`
- `App/src/services/bleService.ts`
- `App/src/types/glove.ts`
- `App/app.json`
- `App/package.json`

### Testes manuais

- Permissao Bluetooth.
- BLE desligado.
- Dispositivo nao encontrado.
- Conectar/desconectar.
- Sair e voltar da tela Luvas.
- Fechar e abrir App.

### Definicao de concluido

- App conecta em pelo menos uma ESP32.
- Dados chegam na tela.
- UI mostra estado real.
- Erros de permissao/conexao sao compreensiveis.

---

## 15. Etapa 13 - Calibracao real dos sensores

**Status:** futura.  
**Tipo:** funcionalidade tecnica.  
**Branch sugerida:** `feature/glove-calibration`.

### Objetivo

Transformar a tela de calibracao demonstrativa em um fluxo real de calibracao dos sensores.

### Fluxo inicial sugerido

1. Verificar luvas conectadas.
2. Orientar o usuario a manter a mao aberta.
3. Capturar valores minimos/base.
4. Orientar o usuario a fechar a mao.
5. Capturar valores maximos.
6. Testar posicao neutra.
7. Salvar calibracao.
8. Usar calibracao para normalizar leituras.

### Dados a salvar

- Minimo por sensor.
- Maximo por sensor.
- Data da calibracao.
- Dispositivo/luva associada.
- Usuario associado.

### Onde salvar

Decisao futura:

- Local no App para resposta rapida.
- API/Neon para backup/sincronizacao.
- Ambos, se houver estrategia offline-first.

### Fora do escopo

- Nao reconhecer sinais ainda.
- Nao treinar IA ainda.
- Nao criar dicionario automatico ainda.

### Arquivos provaveis

- `App/src/app/calibration.tsx`
- `App/src/services/bleService.ts`
- `App/src/services/calibrationService.ts`
- API futura se a calibracao for persistida online.

### Definicao de concluido

- Calibracao real executada.
- Leituras normalizadas aparecem corretamente.
- Calibracao persiste entre sessoes.
- App bloqueia calibracao sem luvas conectadas.

---

## 16. Etapa 14 - Traducao MVP

**Status:** futura.  
**Tipo:** funcionalidade principal.  
**Branch sugerida:** `feature/translation-mvp`.

### Objetivo

Criar a primeira versao funcional da traducao de sinais, com poucos sinais reconhecidos de forma confiavel.

### Estrategia recomendada para MVP

Comecar simples, sem IA pesada:

- Regras manuais baseadas em flexao dos dedos.
- Regras de movimento simples baseadas em IMU.
- Pequeno conjunto de sinais.
- Feedback visual na tela Traduzir.
- Historico curto da sessao.
- TTS simples para falar a frase detectada.

### Sinais iniciais sugeridos

Definir posteriormente com base no TCC, mas o conjunto deve ser pequeno. Exemplos de categorias:

- Saudacoes.
- Necessidades basicas.
- Respostas simples.
- Frases de apresentacao.

### Fora do escopo

- Nao prometer traducao completa de Libras.
- Nao tentar reconhecer muitos sinais no inicio.
- Nao usar IA/modelo sem base de dados suficiente.
- Nao chamar placeholder de reconhecimento real.

### Arquivos provaveis

- `App/src/app/translate.tsx`
- `App/src/services/translationService.ts`
- `App/src/types/glove.ts`
- `App/src/types/translation.ts`
- Possiveis dados locais de sinais/regras.

### Definicao de concluido

- Pelo menos alguns sinais sao reconhecidos em condicoes controladas.
- Tela Traduzir exibe resultado real.
- Usuario consegue limpar/reproduzir resultado.
- Limitacoes ficam claras.

---

## 17. Etapa 15 - Preparacao para TCC/apresentacao

**Status:** futura.  
**Tipo:** documentacao/demonstracao.  
**Branch sugerida:** `docs/tcc-presentation`.

### Objetivo

Preparar o projeto para apresentacao, mesmo que algumas funcionalidades ainda estejam em MVP.

### Entregaveis recomendados

- Roteiro de apresentacao curto.
- Explicacao da arquitetura App + API + Luvas.
- Prints das telas principais.
- Video demonstrativo.
- Fluxo do usuario.
- Diagrama tecnico.
- Lista de materiais da luva.
- Pinagem dos sensores.
- Limitacoes conhecidas.
- Proximos passos.

### Pontos que precisam ficar claros

- O projeto e uma tecnologia assistiva.
- O foco e acessibilidade e comunicacao.
- A traducao completa de Libras e complexa.
- O MVP reconhece um conjunto limitado de sinais.
- As luvas usam sensores para capturar movimento/flexao.
- A API apoia autenticacao, dicionario e dados do usuario.

### Fora do escopo

- Nao criar promessas irreais.
- Nao apresentar dados ficticios como reais.
- Nao esconder limitacoes tecnicas.

### Definicao de concluido

- Apresentacao clara.
- Demo funcional ou modo demonstracao confiavel.
- Documentacao pronta para explicar escolhas tecnicas.
- Riscos e limitacoes documentados.

---

## 18. Etapa 16 - Pos-TCC e evolucao do produto

**Status:** futura/opcional.  
**Tipo:** expansao.

### Objetivo

Evoluir o Luvia de prototipo/TCC para produto ou pesquisa mais avancada.

### Possibilidades

- Melhorar reconhecimento de sinais.
- Criar base de dados de gestos por usuario.
- Treinar modelo personalizado.
- Sincronizacao offline-first.
- Modo conversa.
- Voz personalizada/clonada, se legal e tecnicamente viavel.
- Dashboard de progresso.
- Publicacao controlada para testes.
- Melhorar hardware e ergonomia das luvas.

### Cuidados

- Validar privacidade e seguranca.
- Evitar prometer traducao universal.
- Testar com usuarios reais apenas com consentimento.
- Documentar limitacoes.

---

## 19. Backlog priorizado

### Prioridade alta

1. Fechar backlog tecnico e branches antigas.
2. Corrigir senha minima no cadastro do App.
3. Melhorar tratamento de erros e timeout da API no App.
4. Melhorar comportamento de sessao em falha de rede.
5. Gerar APK preview instalavel.
6. Definir protocolo BLE antes de codar.

### Prioridade media

1. Preferencias com rollback em falha.
2. Dicionario com detalhes/favoritos completos.
3. Notificacoes mais reais ou claramente demonstrativas.
4. Home sem indicadores ficticios ou com rotulos de demonstracao.
5. SMTP/recuperacao de senha.
6. Persistencia de avatar fora do disco local do Render.

### Prioridade baixa neste momento

1. Modo escuro global real.
2. TTS avancado/voz clonada.
3. IA local na ESP32.
4. Publicacao em loja.
5. Analytics completos.

---

## 20. Prompts base para o Codex

### 20.1 Prompt padrao de auditoria

```text
Estamos iniciando a etapa [NOME_DA_ETAPA] do projeto Luvia.

Antes de alterar arquivos:
1. Leia os arquivos relevantes.
2. Confirme o estado do Git.
3. Identifique o escopo minimo.
4. Proponha um plano de implementacao.
5. Liste os arquivos que pretende alterar.
6. Liste os testes que serao executados.
7. Nao implemente nada ainda.
8. Aguarde minha aprovacao.

Regras:
- Nao instalar pacotes sem justificar.
- Nao rodar migrations sem autorizacao.
- Nao alterar .env real.
- Nao criar commit automaticamente.
- Nao alterar arquivos fora do escopo.
- Nao implementar BLE, IoT ou traducao real se a etapa nao pedir isso.
```

### 20.2 Prompt padrao de implementacao aprovada

```text
Pode implementar o plano aprovado.

Regras obrigatorias:
1. Alterar somente os arquivos listados no plano.
2. Manter o escopo minimo.
3. Nao instalar pacotes sem nova aprovacao.
4. Nao rodar migrations.
5. Nao alterar .env real.
6. Nao criar commit.
7. Ao final, rodar validacoes combinadas.
8. Mostrar arquivos alterados e resumo do que mudou.
9. Informar como testar no Android.
```

### 20.3 Prompt padrao de revisao pos-implementacao

```text
Revise a implementacao realizada.

Verifique:
1. Se apenas os arquivos aprovados foram alterados.
2. Se o escopo foi respeitado.
3. Se ha codigo morto, imports sem uso ou regressao visual.
4. Se TypeScript passa.
5. Se git diff --check passa.
6. Se os testes manuais foram descritos corretamente.

Nao faca novas alteracoes sem minha aprovacao.
```

---

## 21. Comandos uteis

### Git

```powershell
git status
git branch
git log --oneline -5
git switch main
git pull origin main
git switch -c nome-da-branch
git diff --check
git add caminho/do/arquivo
git commit -m "mensagem do commit"
git push -u origin nome-da-branch
```

### App

```powershell
cd App
npm install
npx tsc --noEmit
npx expo start --clear
npx expo start --dev-client --tunnel --clear
```

### API

```powershell
cd Api
npm install
npx tsc --noEmit
npm run dev
```

### Validacao online

```powershell
# Usar a URL publica do Render sem expor tokens ou segredos
# Testar /health pelo navegador/celular
```

---

## 22. Riscos principais

### Risco 1 - Misturar muitas mudancas na mesma branch

Mitigacao:

- Branches pequenas.
- Uma etapa por vez.
- Commits claros.

### Risco 2 - BLE aumentar complexidade antes da base estar pronta

Mitigacao:

- Fazer build Android antes.
- Definir protocolo antes do firmware.
- Testar BLE com dados simulados antes dos sensores reais.

### Risco 3 - Dados ficticios parecerem reais

Mitigacao:

- Rotular placeholders.
- Usar `—` quando nao houver dado real.
- Evitar porcentagens inventadas.

### Risco 4 - Ambiente local e build instalado divergirem

Mitigacao:

- Documentar URL da API usada.
- Testar build instalado sem PC.
- Evitar depender de cache do Expo/Metro.

### Risco 5 - Render nao persistir arquivos locais

Mitigacao:

- Tratar avatar como recurso com armazenamento apropriado futuramente.
- Nao depender de disco local para arquivos importantes.

---

## 23. Norte tecnico do projeto

O Luvia deve evoluir nesta ordem:

1. Base confiavel.
2. App instalavel.
3. Contrato dos dados das luvas.
4. Firmware BLE basico.
5. App recebendo dados reais.
6. Calibracao.
7. Reconhecimento simples.
8. Demo/TCC.
9. Evolucao com IA e recursos avancados.

A prioridade nao e implementar tudo rapido, mas implementar sem baguncar a arquitetura, sem simular dados como se fossem reais e sem perder controle do repositorio.

---

## 24. Proxima acao recomendada

A proxima acao pratica e iniciar a Etapa 7.

Prompt sugerido para o Codex:

```text
Estamos iniciando a Etapa 7 do projeto Luvia: fechamento tecnico da base estabilizada e planejamento do proximo bloco.

Contexto:
A base App + API online foi estabilizada e validada:
- App e Api estao na raiz do projeto;
- API esta publicada no Render;
- App usa EXPO_PUBLIC_API_URL online;
- autenticacao, sessao, rotas privadas e logout foram revisados;
- visual mobile, Safe Area, cards e bottom navigation foram ajustados;
- tela Traduzir existe como placeholder;
- tela Luvas esta organizada como aguardando conexao;
- Etapa 6 de validacao geral passou no Android;
- merge da feature para main foi resolvido mantendo App/ e Api/.

Objetivo:
Fazer uma auditoria leve do estado atual e montar o backlog tecnico das proximas etapas, sem alterar arquivos inicialmente.

Tarefas:
1. Confirmar branch atual, ultimo commit e git status.
2. Confirmar se main esta atualizada com origin/main.
3. Listar branches locais existentes e sugerir quais podem ser mantidas ou removidas.
4. Revisar rapidamente App e Api para registrar pendencias conhecidas.
5. Separar pendencias em:
   - bugs/ajustes pequenos;
   - melhorias visuais;
   - funcionalidades futuras;
   - infraestrutura/build;
   - BLE/IoT;
   - TCC/apresentacao.
6. Propor a proxima sequencia de etapas:
   - Etapa 8A;
   - Etapa 8B;
   - Etapa 9;
   - Etapa 10 em diante.
7. Nao implementar correcoes ainda.

Regras:
- Nao alterar arquivos.
- Nao instalar pacotes.
- Nao rodar migrations.
- Nao alterar .env.
- Nao criar commit.
- Nao mexer em BLE, IoT ou traducao real ainda.
- Nao remover branches sem aprovacao.

Ao final, entregue:
1. Estado atual do Git.
2. Backlog tecnico organizado por prioridade.
3. Proxima etapa recomendada.
4. Nome de branch sugerido para a proxima implementacao.
5. Arquivos que provavelmente serao afetados na proxima etapa.
```

---

## 25. Observacao final

Este arquivo deve ser atualizado sempre que uma etapa for concluida. Ele nao precisa ser perfeito desde o inicio, mas deve funcionar como a fonte principal de orientacao do projeto para evitar retrabalho, decisoes soltas e mudancas fora de escopo.
