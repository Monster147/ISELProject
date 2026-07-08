# Aplicação Móvel — Guia de Execução

Este documento descreve como compilar e executar a aplicação **móvel** (Expo/React Native) em Windows e em Linux (distribuições baseadas em Ubuntu).

É necessário ter o **Android SDK** instalado e corretamente configurado através do Android Studio. Antes de compilar, deve criar um ficheiro `.env` na pasta `movel` com o URL da API fornecido pelo Ngrok (ver secção **Configuração do URL da API** abaixo).

## Pré-requisitos

- **Node.js** — em Linux pode instalá-lo via NVM
- **Android SDK** configurado
- **Backend em execução** e URL do Ngrok disponível

## Configuração do URL da API

A aplicação obtém o URL da API a partir de uma variável de ambiente definida num ficheiro `.env` na pasta `movel`. Crie esse ficheiro com o URL base fornecido pelo Ngrok (sem o sufixo `/api`):

```
EXPO_PUBLIC_API_URL=<URL fornecido pelo Ngrok>
```

Sempre que o URL do Ngrok mudar, basta atualizar este valor.

## Windows

Num terminal na pasta `movel`:
```
npm install
npx expo prebuild
```
Na pasta `android` gerada, crie o ficheiro `local.properties` a indicar o caminho para o Android SDK:
```
sdk.dir=C:/Users/<utilizador>/AppData/Local/Android/Sdk
```
Num terminal na pasta `android`:
```
.\gradlew assembleRelease
```
O APK gerado fica em:
```
frontend\movel\android\app\build\outputs\apk\release\app-release.apk
```

## Linux

Num terminal na pasta `movel`:
```
npm install
npx expo prebuild
```
Na pasta `android` gerada, crie o ficheiro `local.properties` a indicar o caminho para o Android SDK:
```
sdk.dir=/home/<utilizador>/Android/Sdk
```
Num terminal na pasta `android`:
```
chmod +x gradlew
./gradlew assembleRelease
```
O APK gerado fica em:
```
frontend/movel/android/app/build/outputs/apk/release/app-release.apk
```