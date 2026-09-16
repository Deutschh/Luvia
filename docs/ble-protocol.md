# Protocolo BLE das luvas Luvia

**Versão do documento:** 1.0
**Versão do protocolo:** 1.0.0
**Status:** contrato aprovado para o primeiro firmware simulado
**Transporte:** Bluetooth Low Energy (BLE), GATT customizado

## 1. Objetivo

Este documento define o contrato entre o App Luvia e as duas luvas inteligentes. Ele é a referência para o firmware ESP32-S3, o futuro cliente BLE do App, decoders, simuladores e testes de integração.

O protocolo v1 transporta telemetria de flexão, orientação, aceleração, velocidade angular, bateria e estado de calibração. Ele não define reconhecimento de Libras, tradução, síntese de voz, algoritmo de calibração, pinagem elétrica ou sincronização com a API.

Os termos **DEVE**, **NÃO DEVE**, **DEVERIA** e **PODE** indicam requisitos, proibições, recomendações e comportamentos opcionais deste contrato.

## 2. Arquitetura física

- Cada luva possui sua própria ESP32-S3, bateria, IMU BNO055 e cinco sensores de flexão.
- O App mantém duas conexões BLE independentes: uma para a luva esquerda e outra para a direita.
- Cada dispositivo possui `side` e `deviceId` persistentes, gravados durante o provisionamento.
- A troca do lado configurado exige reprovisionamento; o lado não pode mudar durante uma conexão.
- O firmware não realiza tradução. Ele mede, normaliza e transmite os sensores.
- A calibração dos sensores será persistida na NVS da própria luva. O algoritmo e o fluxo de calibração serão definidos em etapa futura.

Para o MVP, a tradução exige as duas luvas prontas e transmitindo. Um modo de tradução com apenas uma luva não faz parte do protocolo v1.

## 3. Descoberta e identificação

### 3.1 Nome anunciado

| Lado | Formato do nome |
| --- | --- |
| Esquerda | `LUVIA-L-XXXX` |
| Direita | `LUVIA-R-XXXX` |

`XXXX` corresponde aos quatro últimos dígitos hexadecimais do `deviceId`, em maiúsculas. O nome auxilia a seleção humana, mas **não é prova de identidade nem fonte oficial do lado**.

### 3.2 Advertising legacy do v1

O protocolo v1 usa advertising legacy, limitado a 31 bytes no advertising packet e a outros 31 bytes no scan response. Para respeitar esse limite, o dispositivo deve distribuir os campos assim:

**Advertising packet:**

| Estrutura AD | Conteúdo | Tamanho total |
| --- | --- | ---: |
| Flags | flags BLE padrão | 3 bytes |
| Complete List of 128-bit Service UUIDs | Luvia Glove Service UUID | 18 bytes |
| Shortened Local Name | `LUVIA-L` ou `LUVIA-R` | 9 bytes |

Total do advertising packet: `3 + 18 + 9 = 30 bytes`, dentro do limite de 31 bytes.

**Scan response:**

| Estrutura AD | Conteúdo | Tamanho total |
| --- | --- | ---: |
| Complete Local Name | `LUVIA-L-XXXX` ou `LUVIA-R-XXXX` | 14 bytes |

Metadados extras podem ser acrescentados ao scan response somente se o total continuar menor ou igual a 31 bytes. Eles não fazem parte do contrato obrigatório do v1 e não podem ser usados como identidade definitiva.

O v1 não exige Service Data no advertising. O App pode usar o Service UUID e o nome encurtado para descoberta inicial e o nome completo do scan response para ajudar o usuário. Após conectar, deve ler Device Info e validar `deviceId`, `side` e versão. O App nunca deve confiar somente no advertising ou aceitar um dispositivo apenas porque seu nome começa com `LUVIA-`.

## 4. Serviço e características GATT

Todos os UUIDs são customizados, de 128 bits, e compartilham o mesmo prefixo.

| Item | UUID completo | Propriedades |
| --- | --- | --- |
| Luvia Glove Service | `d973f2e0-b19e-4f31-9f5a-8c6d7e200000` | Primary Service |
| Device Info | `d973f2e0-b19e-4f31-9f5a-8c6d7e200001` | Read |
| Telemetry | `d973f2e0-b19e-4f31-9f5a-8c6d7e200002` | Notify |
| Status | `d973f2e0-b19e-4f31-9f5a-8c6d7e200003` | Read, Notify |
| Command | `d973f2e0-b19e-4f31-9f5a-8c6d7e200004` | Write with response |
| Command Response | `d973f2e0-b19e-4f31-9f5a-8c6d7e200005` | Indicate |

### 4.1 Sequência obrigatória até `ready`

O App deve cumprir esta sequência antes de considerar a luva `ready`:

1. estabelecer a conexão BLE;
2. solicitar ou negociar ATT MTU e validar que o valor efetivo comporta a telemetria;
3. descobrir o Luvia Glove Service e as cinco características obrigatórias;
4. ler Device Info;
5. validar `side`, `deviceId` e `protocolMajor`;
6. ler o Status inicial;
7. habilitar a inscrição de `Notify` em Telemetry;
8. habilitar a inscrição de `Notify` em Status;
9. habilitar a inscrição de `Indicate` em Command Response;
10. mudar o estado da luva para `ready`.

Nenhum comando deve ser enviado antes de Command Response estar inscrita. O estado `streaming` só começa depois que `START_STREAM` recebe Command Response com `success` e chega a primeira notificação Telemetry válida.

## 5. Convenções binárias

- Todos os campos com mais de um byte usam **little-endian**.
- Inteiros assinados usam complemento de dois.
- O protocolo v1 não adiciona CRC próprio. A integridade do transporte é responsabilidade das camadas BLE.
- Campos reservados devem ser enviados como zero e ignorados pelo receptor.
- `side=0` representa esquerda e `side=1` representa direita. Outros valores são inválidos no protocolo v1.
- `sequence` é um `uint16` little-endian válido somente dentro de uma sessão de streaming, conforme a seção 5.1.
- `uptimeMs` representa o instante de coleta da amostra, em milissegundos desde o boot da luva. Ele não é horário Unix.

### 5.1 Ciclo de vida de `sequence`

- Uma sessão de streaming começa quando `START_STREAM` é aceito e termina por `STOP_STREAM`, desconexão ou reboot/reset da ESP32-S3.
- O primeiro pacote Telemetry válido depois de cada `START_STREAM` aceito deve usar `sequence=0`.
- A sequência incrementa em uma unidade a cada amostra Telemetry enviada.
- `STOP_STREAM` seguido por outro `START_STREAM` cria uma nova sessão e reinicia a sequência em `0`.
- Reboot ou reset da ESP32-S3 também reinicia a sequência em `0`.
- `SET_RATE` durante streaming não cria uma nova sessão e não reinicia a sequência.
- O wrap normal de `65535` para `0` faz parte da mesma sessão e não é erro.
- O App deve detectar pacotes duplicados, perdas e pacotes fora de ordem dentro da mesma sessão.
- Uma sequência menor que a anterior só pode ser aceita quando corresponder ao wrap esperado, a um reboot detectado ou ao primeiro pacote de uma nova sessão iniciada por `START_STREAM`.
- Após reconectar, o App deve reler Device Info e Status, renegociar e validar o MTU, enviar `START_STREAM` novamente e tratar a primeira Telemetry com `sequence=0` como início de uma nova sessão.
- `sequence` não é um identificador global ou persistente e não deve ser comparado entre sessões de streaming.

## 6. ATT MTU e frequência

- A ESP32, como periférico, deve configurar suporte e MTU preferencial de pelo menos 64 bytes e responder à troca de MTU iniciada pelo central.
- O App, como central, deve solicitar ou negociar ATT MTU 64 depois de conectar e antes de descobrir ou usar a telemetria.
- O App deve validar o MTU efetivamente negociado antes de enviar `START_STREAM`.
- Uma notificação com valor de 42 bytes exige ATT MTU efetivo de pelo menos 45 bytes, pois a notificação usa 3 bytes adicionais de overhead ATT.
- Se o MTU efetivo for menor que 45, o App deve marcar a luva como `incompatible` e não iniciar o streaming.
- O pacote de telemetria tem 42 bytes. Uma notificação contém exatamente uma amostra completa; não existe fragmentação no protocolo v1.
- A frequência padrão é 25 Hz, equivalente a uma amostra a cada 40 ms por luva.
- As frequências aceitas são 10, 25 e 50 Hz.
- O firmware não deve aceitar frequências diferentes dessas no protocolo v1.

O alvo de negociação do v1 é ATT MTU 64. Um valor efetivo entre 45 e 63 ainda comporta a amostra e pode ser aceito; abaixo de 45 o link é incompatível com o protocolo.

## 7. Device Info

Device Info é lido após a descoberta das características e tem exatamente 18 bytes.

| Offset | Tamanho | Tipo | Campo |
| ---: | ---: | --- | --- |
| 0 | 1 | `uint8` | `protocolMajor` |
| 1 | 1 | `uint8` | `protocolMinor` |
| 2 | 1 | `uint8` | `protocolPatch` |
| 3 | 1 | `uint8` | `side` |
| 4–9 | 6 | `uint48` | `deviceId` little-endian |
| 10 | 1 | `uint8` | `firmwareMajor` |
| 11 | 1 | `uint8` | `firmwareMinor` |
| 12 | 1 | `uint8` | `firmwarePatch` |
| 13 | 1 | `uint8` | `hardwareRevision` |
| 14–15 | 2 | `uint16` | `capabilities` |
| 16 | 1 | `uint8` | `flexSensorCount`, obrigatoriamente `5` no v1 |
| 17 | 1 | `uint8` | reservado, obrigatoriamente `0` |

Soma: `1+1+1+1+6+1+1+1+1+2+1+1 = 18 bytes`.

O `deviceId` é um identificador persistente de 48 bits provisionado na luva e não deve depender do endereço BLE aleatório da conexão. Sua forma legível contém 12 dígitos hexadecimais em maiúsculas e preenchidos com zero.

### 7.1 Capabilities

| Bit | Capacidade |
| ---: | --- |
| 0 | cinco sensores de flexão |
| 1 | quaternion da IMU |
| 2 | aceleração linear da IMU |
| 3 | velocidade angular da IMU |
| 4 | leitura de bateria |
| 5 | calibração persistente em NVS |
| 6 | dispositivo ou firmware de simulação |
| 7–15 | reservados |

Uma luva v1 utilizável pelo fluxo completo deve anunciar os bits 0 a 5. O bit 6 só deve estar ativo em firmware explicitamente simulado.

## 8. Telemetria

Telemetry usa `Notify` e transmite uma notificação de exatamente 42 bytes por amostra.

| Offset | Tamanho | Tipo | Campo e escala |
| ---: | ---: | --- | --- |
| 0 | 1 | `uint8` | `protocolMajor`, obrigatoriamente `1` |
| 1 | 1 | `uint8` | `messageType`, obrigatoriamente `0x01` |
| 2 | 1 | `uint8` | `side`: `0=left`, `1=right` |
| 3 | 1 | `uint8` | `flags` |
| 4–5 | 2 | `uint16` | `sequence` |
| 6–9 | 4 | `uint32` | `uptimeMs` |
| 10 | 1 | `uint8` | bateria: `0–100`; `255=desconhecida` |
| 11 | 1 | `uint8` | calibração da IMU, quatro campos de 2 bits |
| 12–13 | 2 | `uint16` | flexão do polegar, `0–1000`; `65535=indisponível` |
| 14–15 | 2 | `uint16` | flexão do indicador, mesma escala |
| 16–17 | 2 | `uint16` | flexão do médio, mesma escala |
| 18–19 | 2 | `uint16` | flexão do anelar, mesma escala |
| 20–21 | 2 | `uint16` | flexão do mínimo, mesma escala |
| 22–23 | 2 | `int16` | quaternion `w`, Q14 |
| 24–25 | 2 | `int16` | quaternion `x`, Q14 |
| 26–27 | 2 | `int16` | quaternion `y`, Q14 |
| 28–29 | 2 | `int16` | quaternion `z`, Q14 |
| 30–31 | 2 | `int16` | aceleração linear X, mg |
| 32–33 | 2 | `int16` | aceleração linear Y, mg |
| 34–35 | 2 | `int16` | aceleração linear Z, mg |
| 36–37 | 2 | `int16` | velocidade angular X, 0,1°/s |
| 38–39 | 2 | `int16` | velocidade angular Y, 0,1°/s |
| 40–41 | 2 | `int16` | velocidade angular Z, 0,1°/s |

Soma byte a byte:

```text
1 + 1 + 1 + 1 + 2 + 4 + 1 + 1 + 10 + 8 + 6 + 6 = 42 bytes
```

Consequentemente:

```text
offset inicial 0 + comprimento 42 = offset final exclusivo 42
último byte válido = 41
uma notificação = uma amostra
```

### 8.1 Flags

| Bit | Máscara | Nome | Significado quando `1` |
| ---: | ---: | --- | --- |
| 0 | `0x01` | `calibrated` | calibração de flexão válida está carregada |
| 1 | `0x02` | `charging` | bateria está carregando |
| 2 | `0x04` | `lowBattery` | bateria está em 15% ou menos |
| 3 | `0x08` | `flexFault` | ao menos um sensor de flexão está indisponível ou inválido |
| 4 | `0x10` | `imuFault` | dados da IMU não são confiáveis ou estão indisponíveis |
| 5 | `0x20` | `simulated` | amostra foi produzida por firmware ou fonte simulada |
| 6 | `0x40` | reservado | enviar `0`; receptor ignora |
| 7 | `0x80` | reservado | enviar `0`; receptor ignora |

### 8.2 Flexão

- A ordem é sempre polegar, indicador, médio, anelar e mínimo.
- `0` representa o dedo estendido segundo a calibração persistida.
- `1000` representa a máxima flexão segundo a calibração persistida.
- O modelo lógico converte o valor para `0–1` dividindo por `1000`.
- Valores `1001–65534` são inválidos.
- `65535` representa sensor indisponível e deve ser convertido para `null` no modelo lógico.
- Se qualquer sensor estiver indisponível, `flexFault` deve estar ativo.
- Leituras ADC brutas não são transmitidas na telemetria normal do v1.

### 8.3 Quaternion

- Ordem obrigatória: `w`, `x`, `y`, `z`.
- O formato Q14 representa o valor lógico como `raw / 16384`.
- A faixa nominal de cada componente é `-1` a `1`, correspondente a `-16384` a `16384`.
- O quaternion representa a rotação do referencial local da luva para o referencial estabelecido na calibração.
- Quando `imuFault=1`, os campos da IMU devem ser enviados como zero e não podem ser usados para tradução.

### 8.4 Aceleração e velocidade angular

- A aceleração é linear, sem a componente de gravidade, em miligravidades (`mg`).
- Conversão para o modelo lógico: `m/s² = raw × 9.80665 / 1000`.
- A velocidade angular usa décimos de grau por segundo.
- Conversão para o modelo lógico: `°/s = raw / 10`.

Referencial anatômico depois da transformação feita pelo firmware:

- X: do pulso em direção ao dedo médio.
- Z: da palma em direção ao dorso da mão.
- Y: eixo que completa o sistema de coordenadas destro (`Y = Z × X`).

### 8.5 Calibração da IMU

O byte do offset 11 contém quatro valores de 2 bits, todos entre `0` e `3`:

| Bits | Campo |
| --- | --- |
| 0–1 | sistema |
| 2–3 | giroscópio |
| 4–5 | acelerômetro |
| 6–7 | magnetômetro |

`0` significa não calibrado e `3` representa o melhor nível reportado pela IMU. Esse byte não substitui a flag `calibrated`, que se refere à calibração funcional dos sensores de flexão da luva.

## 9. Status

Status pode ser lido e também notifica o App imediatamente quando estado, erro, bateria, frequência ou flags mudarem. Enquanto conectado e com `Notify` habilitado para Status, o firmware deve notificar pelo menos uma vez por segundo.

O pacote tem exatamente 12 bytes:

| Offset | Tamanho | Tipo | Campo |
| ---: | ---: | --- | --- |
| 0 | 1 | `uint8` | `protocolMajor` |
| 1 | 1 | `uint8` | `deviceState` |
| 2 | 1 | `uint8` | `side` |
| 3 | 1 | `uint8` | `errorCode` |
| 4 | 1 | `uint8` | bateria: `0–100`; `255=desconhecida` |
| 5 | 1 | `uint8` | frequência atual: `10`, `25` ou `50`; `0=parada` |
| 6 | 1 | `uint8` | flags definidas na seção 8.1 |
| 7 | 1 | `uint8` | calibração da IMU |
| 8–11 | 4 | `uint32` | `uptimeMs` |

Soma: `1+1+1+1+1+1+1+1+4 = 12 bytes`.

### 9.1 Device State

| Valor | Estado |
| ---: | --- |
| `0x00` | `booting` |
| `0x01` | `idle` |
| `0x02` | `ready` |
| `0x03` | `streaming` |
| `0x04` | reservado para `calibrating` |
| `0x05` | `error` |

### 9.2 Error Code

| Valor | Erro |
| ---: | --- |
| `0x00` | nenhum erro |
| `0x01` | falha em sensor de flexão |
| `0x02` | falha na IMU |
| `0x03` | falha na leitura de bateria |
| `0x04` | falha na NVS/configuração persistida |
| `0x05` | comando ou estado incompatível |
| `0xFF` | erro não classificado |

## 10. Comandos

O App envia comandos usando `Write with response`. A confirmação do write indica apenas que o GATT recebeu os bytes. O resultado da operação chega pela característica Command Response usando `Indicate`.

### 10.1 Formato

| Offset | Tamanho | Tipo | Campo |
| ---: | ---: | --- | --- |
| 0 | 1 | `uint8` | `protocolMajor` |
| 1 | 1 | `uint8` | `transactionId` |
| 2 | 1 | `uint8` | `opcode` |
| 3 | 1 | `uint8` | `payloadLength` |
| 4… | `payloadLength` | bytes | payload |

- O tamanho total é `4 + payloadLength`.
- O protocolo v1 aceita no máximo 16 bytes de payload, portanto um comando tem no máximo 20 bytes.
- `transactionId` é incrementado pelo App como `uint8`, com wrap de `255` para `0`.
- O App não deve reutilizar um `transactionId` enquanto aguarda sua resposta.
- O timeout recomendado para Command Response é 2 segundos.

### 10.2 Operações

| Opcode | Comando | `payloadLength` | Payload | Efeito |
| ---: | --- | ---: | --- | --- |
| `0x01` | `START_STREAM` | 1 | byte 0: `10`, `25` ou `50` Hz | configura a frequência e inicia Telemetry após resposta de sucesso |
| `0x02` | `STOP_STREAM` | 0 | nenhum | interrompe Telemetry; Status continua disponível |
| `0x03` | `SET_RATE` | 1 | byte 0: `10`, `25` ou `50` Hz | aplica a frequência no próximo período completo de amostragem |
| `0x04` | `GET_STATUS` | 0 | nenhum | responde sucesso e emite uma notificação Status atualizada |
| `0x10–0x1F` | reservado | — | — | reservado para calibração futura; não implementar no firmware v1 inicial |

Qualquer frequência diferente de 10, 25 ou 50 deve retornar `invalidPayload` sem alterar a configuração atual.

### 10.3 Command Response

Command Response tem exatamente 6 bytes:

| Offset | Tamanho | Tipo | Campo |
| ---: | ---: | --- | --- |
| 0 | 1 | `uint8` | `protocolMajor` |
| 1 | 1 | `uint8` | `transactionId` copiado do comando |
| 2 | 1 | `uint8` | `opcode` copiado do comando |
| 3 | 1 | `uint8` | `resultCode` |
| 4–5 | 2 | `uint16` | `detailCode`; zero quando não houver detalhe |

Soma: `1+1+1+1+2 = 6 bytes`.

| Valor | Resultado |
| ---: | --- |
| `0x00` | `success` |
| `0x01` | `unsupportedCommand` |
| `0x02` | `invalidPayload` |
| `0x03` | `invalidState` |
| `0x04` | `hardwareFailure` |
| `0x05` | `incompatibleVersion` |

## 11. Modelo lógico

O modelo abaixo é uma representação legível para documentação, debug, fixtures e simulador. **Ele não é transmitido como JSON no BLE v1.** O decoder constrói esse modelo combinando Telemetry, Device Info e o instante monotônico de recebimento no App.

Exemplo coerente com os valores binários `flex=[120,480,510,330,200]`, quaternion `[16384,0,0,0]`, aceleração `[10,-12,8]` mg, velocidade angular `[0,15,-8]` em 0,1°/s, flags `0x01` e calibração `0xFF`:

```json
{
  "protocolVersion": "1.0.0",
  "deviceId": "A1B2C3D4E5F6",
  "side": "left",
  "sequence": 321,
  "sampledAtUptimeMs": 123456,
  "receivedAtMonotonicMs": 987654321,
  "batteryPercent": 87,
  "source": "ble",
  "flags": {
    "calibrated": true,
    "charging": false,
    "lowBattery": false,
    "flexFault": false,
    "imuFault": false,
    "simulated": false
  },
  "flex": {
    "thumb": 0.12,
    "index": 0.48,
    "middle": 0.51,
    "ring": 0.33,
    "pinky": 0.2
  },
  "imu": {
    "orientationQuaternion": {
      "w": 1.0,
      "x": 0.0,
      "y": 0.0,
      "z": 0.0
    },
    "linearAccelerationMps2": {
      "x": 0.0980665,
      "y": -0.1176798,
      "z": 0.0784532
    },
    "angularVelocityDps": {
      "x": 0.0,
      "y": 1.5,
      "z": -0.8
    },
    "calibration": {
      "system": 3,
      "gyroscope": 3,
      "accelerometer": 3,
      "magnetometer": 3
    }
  }
}
```

`deviceId` e a versão completa vêm de Device Info. `receivedAtMonotonicMs` é acrescentado pelo App. Se a flag `simulated` estiver ativa, `source` deve ser `simulated`; caso contrário, deve ser `ble`.

Confiança ou precisão da tradução não pertence à telemetria das luvas. Esse valor será produzido futuramente pelo reconhecedor de sinais.

## 12. Estados no App

Cada luva possui seu próprio estado de conexão:

| Estado | Significado |
| --- | --- |
| `bluetoothUnavailable` | hardware ou Bluetooth indisponível |
| `permissionRequired` | permissão necessária não concedida |
| `scanning` | procurando dispositivos |
| `discovered` | anúncio compatível encontrado, ainda não conectado |
| `connecting` | conexão ou descoberta GATT em andamento |
| `connected` | link estabelecido, contrato ainda não validado |
| `ready` | conexão, MTU, serviço, características, Device Info, Status inicial e três inscrições validados |
| `streaming` | `START_STREAM` foi aceito e amostras válidas estão sendo recebidas |
| `stale` | fluxo deveria estar ativo, mas as amostras pararam |
| `reconnecting` | tentando restaurar a conexão conhecida |
| `disconnected` | sem conexão e sem tentativa automática ativa |
| `incompatible` | versão, MTU ou características incompatíveis |
| `error` | falha não recuperável no fluxo atual |

Estado agregado das duas luvas:

- `disconnected`: nenhuma luva pronta.
- `partial`: somente uma luva pronta.
- `ready`: ambas prontas, sem streaming.
- `streaming`: ambas recebendo amostras válidas.
- `degraded`: tradução estava ativa e uma luva ficou `stale`, desconectada ou com falha.

## 13. Perda de conexão e reconexão

- Enquanto `streaming`, ausência de pacote válido por `max(500 ms, 5 × intervalo da amostra)` muda a luva para `stale`.
- Em 10, 25 e 50 Hz, o limite mínimo efetivo continua sendo 500 ms.
- A tradução deve pausar imediatamente em `stale`, sem inventar, repetir ou interpolar a mão ausente.
- Após 2 segundos sem pacote, ou imediatamente após callback de desconexão do sistema, o estado muda para `reconnecting`.
- As tentativas automáticas ocorrem após 1, 2, 4, 8 e 10 segundos, sem ultrapassar uma janela total de 30 segundos.
- A reconexão procura o mesmo `deviceId`, não apenas outro dispositivo com nome ou lado iguais.
- Após reconectar, o App relê Device Info e Status, renegocia MTU, valida a versão e, se a sessão de tradução ainda estiver ativa, envia um novo `START_STREAM`. A primeira Telemetry válida inicia uma nova sessão com `sequence=0`.
- Se a janela de 30 segundos terminar, o estado muda para `disconnected` e passa a exigir ação explícita do usuário.
- O histórico já confirmado no App pode ser preservado, mas nenhuma frase nova deve ser produzida durante a lacuna.
- Sequências duplicadas, perdidas ou fora de ordem devem ser tratadas pelas regras da seção 5.1.

Cada luva possui relógio próprio. O App deve estimar a relação entre `uptimeMs` e seu relógio monotônico na recepção e alinhar amostras esquerda/direita pelo instante estimado mais próximo. Não existe sincronização de relógio entre as ESP32 no protocolo v1.

## 14. Modo simulado

O simulador deve produzir os mesmos bytes de Device Info, Status, Telemetry e Command Response usados por uma luva real. Ele deve passar pelo mesmo decoder e pelas mesmas validações; não deve injetar diretamente objetos lógicos já convertidos.

Identidades reservadas para testes:

| Lado | Alias lógico | `deviceId` binário |
| --- | --- | --- |
| Esquerda | `SIM-L-0001` | `0x53494D4C0001` |
| Direita | `SIM-R-0001` | `0x53494D520001` |

O simulador deve:

- ativar `simulated` nas flags e a capability de simulação;
- usar uma semente fixa quando o teste precisar ser reproduzível;
- suportar 10, 25 e 50 Hz;
- responder aos quatro comandos definidos;
- fornecer cenários de operação normal, bateria baixa, flexão inválida, falha da IMU, pacote duplicado, pacote fora de sequência, interrupção e reconexão;
- identificar visualmente no App, quando implementado, que os dados são simulados.

## 15. Compatibilidade e validação

### 15.1 Versão

- O App deve validar a versão completa em Device Info antes de iniciar streaming.
- `protocolMajor` diferente de `1` torna o dispositivo incompatível.
- Uma versão minor mais alta pode ser aceita somente se mantiver os UUIDs obrigatórios, comprimentos, offsets, escalas e semântica definidos para o major 1.
- Versões minor podem adicionar características opcionais ou capabilities, mas não podem acrescentar bytes ao pacote Telemetry de 42 bytes.
- Patch é informativo e não pode alterar o wire format.
- Qualquer mudança incompatível exige novo major.

### 15.2 Rejeição de dados

O App deve rejeitar uma notificação Telemetry quando:

- o comprimento for diferente de 42 bytes;
- `protocolMajor` for incompatível;
- `messageType` não for `0x01`;
- `side` divergir do Device Info validado;
- `side` não for `0` ou `1`.

Bits reservados em flags não invalidam o pacote e devem ser ignorados. Um valor de flexão entre `1001` e `65534` deve ser convertido para `null` e tratado como falha de flexão. Bateria entre `101` e `254` deve ser tratada como desconhecida.

## 16. Segurança e limitações conhecidas

- O protocolo v1 não possui autenticação própria de dispositivo.
- Bonding forte e proteção contra man-in-the-middle não fazem parte do MVP.
- Nome, Service UUID e lado anunciado podem ser imitados por outro dispositivo.
- A validação de `deviceId`, lado e versão reduz conexões acidentais, mas não impede spoofing deliberado.
- O usuário deve selecionar explicitamente as luvas durante o primeiro vínculo.
- Nenhum dado pessoal, token, credencial ou informação da conta é enviado às luvas.
- Segurança de pareamento e identidade autenticada devem ser revistas antes de um produto de produção.

## 17. Critérios de aceitação para o próximo firmware

O primeiro firmware simulado estará aderente ao contrato quando:

1. produzir o advertising packet de 30 bytes com Flags, Service UUID e Shortened Local Name, além do Complete Local Name no scan response;
2. expor as cinco características com UUIDs e propriedades exatas;
3. retornar Device Info válido de 18 bytes;
4. configurar suporte e MTU preferencial de pelo menos 64 bytes e responder corretamente à negociação iniciada pelo central;
5. aceitar somente 10, 25 e 50 Hz;
6. responder corretamente a `START_STREAM`, `STOP_STREAM`, `SET_RATE` e `GET_STATUS`;
7. enviar uma notificação de 42 bytes por amostra, sem fragmentação;
8. incrementar `sequence` e preencher `uptimeMs` no instante da coleta;
9. produzir valores coerentes com as escalas e sentinelas deste documento;
10. enviar Status de 12 bytes ao menos uma vez por segundo e em mudanças relevantes enquanto houver inscrição ativa;
11. marcar claramente dados simulados;
12. permitir validar perda de pacotes, falhas e reconexão sem implementar sensores reais;
13. não implementar comandos de calibração reservados;
14. não depender da API do Luvia.

Este contrato permite implementar o firmware simulado e o futuro decoder do App sem redefinir decisões essenciais de transporte ou representação.
