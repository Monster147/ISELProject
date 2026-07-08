# Aplicação Desktop — Guia de Execução

Este documento descreve como executar a aplicação **desktop** (Electron) em Windows e em Linux (distribuições baseadas em Ubuntu), nas versões de desenvolvimento e de produção.

Antes de arrancar a aplicação, deve criar um ficheiro `.env` na pasta `desktop` com o URL da API fornecido pelo Ngrok (ver secção **Configuração do URL da API** abaixo).

## Pré-requisitos

- **Node.js** — em Linux pode instalá-lo via NVM (ver abaixo)
- **Backend em execução** e URL do Ngrok disponível

## Configuração do URL da API

A aplicação obtém o URL da API a partir de uma variável de ambiente definida num ficheiro `.env` na pasta `desktop`. Crie esse ficheiro com o URL base fornecido pelo Ngrok (sem o sufixo `/api`):

```
EXPO_PUBLIC_API_URL=<URL fornecido pelo Ngrok>
```

Sempre que o URL do Ngrok mudar, basta atualizar este valor.

Em Linux, para instalar o Node.js via NVM (feche e reabra o terminal no fim):
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
nvm install --lts
```

---

## Versão de desenvolvimento (`dev`)

### Windows

Num terminal na pasta `desktop`:
```
npm install
npm run dev
```
(crie o `.env` na pasta `desktop` antes do `npm run dev` — ver secção acima)

### Linux

Num terminal na pasta `desktop`:
```
npm install
```
Antes de arrancar, corrija as permissões do *sandbox* do Electron:
```
sudo chown root:root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```
Por fim (com o `.env` já criado):
```
npm run dev
```

---

## Versão de produção

### Windows

Num terminal, em modo administrador, na pasta `frontend/desktop`:
```
npm install
npm run dist:win
```
No fim, abra a pasta `dist` gerada e execute o ficheiro `ira 0.0.0.exe`.

### Linux

Num terminal na pasta `desktop`:
```
npm install
```
Antes de gerar o executável, garanta que os ficheiros pertencem ao seu utilizador:
```
sudo chown -R $USER:$USER .
```
Gere o executável:
```
npm run dist:linux
```
No fim, atribua permissões, instale a dependência necessária e execute o AppImage:
```
chmod +x ./dist/ira-0.0.0.AppImage
sudo apt install libfuse2t64
./dist/ira-0.0.0.AppImage
```