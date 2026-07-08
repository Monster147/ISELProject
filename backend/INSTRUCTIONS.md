# Backend — Guia de Execução

Este documento descreve como executar o **backend** (API + base de dados) em Windows e em Linux (distribuições baseadas em Debian/Ubuntu).

O `gradlew` encontra-se na **raiz do repositório**. As tarefas `buildImageAll`, `allUp` e `allDown` são executadas a partir daí, sendo os contentores Docker geridos automaticamente na pasta `backend/app`.

## Pré-requisitos

- **Docker** — Docker Desktop (Windows) ou Docker Engine (Linux)
- **JDK 22** — necessário para o Gradle
- **Ngrok** — para expor a API publicamente

## Windows

1. Inicie o Docker Desktop, autentique-se e confirme que o Docker Engine está em execução.
2. Num terminal na raiz do repositório, execute:
```
.\gradlew buildImageAll
.\gradlew allUp
```
3. Caso seja a primeira utilização do Ngrok, autentique-se com a sua conta.
4. Num novo terminal, exponha a porta 8080:
   ```
   ngrok http 8080
   ```

Para parar o servidor: `.\gradlew allDown`

## Linux

### 1. Instalar o JDK 22

Faça o download da versão 22.0.2 do JDK e, a partir da pasta onde o descarregou:
```
cd ~/Downloads
tar -xvzf jdk-22.0.2_linux-x64_bin.tar.gz
sudo mv jdk-22.0.2 /opt/
```
Abra o `~/.bashrc` (`nano ~/.bashrc`) e acrescente no final, guardando e fechando no fim:
```
export JAVA_HOME=/opt/jdk-22.0.2
export PATH=$JAVA_HOME/bin:$PATH
```

### 2. Instalar o Gradle (via SDKMAN)

Após instalar, feche o terminal e abra um novo para as alterações terem efeito:
```
curl -s "https://get.sdkman.io" | bash
sdk install gradle
```

### 3. Executar o servidor

Com o Docker Engine em execução, num terminal na raiz do repositório:
```
chmod +x gradlew
./gradlew buildImageAll
./gradlew allUp
```
Para parar o servidor: `./gradlew allDown`

### 4. Instalar e executar o Ngrok

```
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
  && echo "deb https://ngrok-agent.s3.amazonaws.com bookworm main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list \
  && sudo apt update \
  && sudo apt install ngrok
```
Autentique-se e exponha a porta 8080:
```
ngrok config add-authtoken $YOUR_AUTHTOKEN
ngrok http 8080
```