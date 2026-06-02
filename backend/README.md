# Backend

Esta componente atua como o núcleo lógico do sistema, sendo responsável por mediar a comunicação entre o cliente e a camada de persistência.

O desenvolvimento do servidor foi realizado em *Kotlin*. A arquitetura da API assenta no *framework Spring*, o que agiliza a gestão de rotas e a implementação de mecanismos de segurança através do seu sistema de anotações. A comunicação com as aplicações cliente é realizada através da ferramenta de rede *Ngrok*, que estabelece um túnel seguro via HTTPS para a exposição pública da API. Dada a natureza crítica e sensibilidade dos dados, os processos de registo e autenticação de utilizadores encontram-se centralizados no *backend*. Esta abordagem garante o controlo de acessos e assegura que todas as validações de segurança são executadas exclusivamente no lado do servidor.

---

## Arquitetura

A API atua como a camada central do sistema, sendo responsável pelo processamento de pedidos HTTP e pela execução das seguintes operações:

- Gestão de utilizadores, incluindo o processamento de credenciais e controlo de acessos;
- Gestão do ciclo de vida das ocorrências, abrangendo a sua criação, caracterização e atualização;
- Administração de entidades, nomeadamente o processamento adicional, ou seja, criar, remover, atualizar e procurar evidências, relatórios e intervenientes.

O *backend* foi estruturado em cinco camadas principais:

- **`app/`** — Camada responsável pela configuração da aplicação, infraestrutura e o ponto de entrada do *backend*;
- **`http/`** — Camada responsável por expor os *endpoints* da API, gerindo a receção de pedidos HTTP e a formulação das respetivas respostas;
- **`domain/`** — Define o modelo de domínio da aplicação, contendo as entidades e estruturas de dados que representam a lógica de negócio;
- **`service/`** — Camada onde reside a lógica de negócio e as regras de validação. Estes componentes coordenam o fluxo de dados entre os *controllers* e os *repositories*;
- **`repo/`** — Camada de persistência que estabelece a interface entre a base de dados e a aplicação, utilizando a biblioteca JDBI para a execução de consultas SQL.

<p align="center">
  <img src="docs/diagrams/DiagramaBackend.png" alt="Arquitetura multicamada do *backend*" width="450">
</p>

Esta arquitetura multicamada garante a independência entre componentes, facilitando a manutenção futura e permitindo que alterações numa camada (como a substituição de uma base de dados) tenham um impacto reduzido nas restantes. Toda a infraestrutura, incluindo o servidor e a base de dados, é executada de forma isolada através de *containers Docker*.

O fluxo de processamento de um pedido no *Spring* inicia-se no *controller*, que valida os dados de entrada através de objetos de transferência de dados (DTOs). À exceção da entidade *Token*, cuja gestão é efetuada internamente pelos mecanismos de segurança, existe um *controller* dedicado para cada entidade do sistema. Após a receção e validação inicial, o *controller* delega a execução da operação para o *service* correspondente, assegurando assim que a lógica de negócio permanece desacoplada da camada de transporte. Por fim, o *service* comunica com o *repository* respetivo, que executa as operações necessárias na base de dados, garantindo a persistência ou a recuperação da informação solicitada.

---

## Base de Dados

No que concerne à persistência dos dados, optou-se pelo sistema de gestão de bases de dados relacional *PostgreSQL*, dada a necessidade de uma arquitetura estruturada que suporte as relações complexas entre entidades. A camada de acesso a dados utiliza a biblioteca JDBI, que simplifica o controlo transacional e otimiza o mapeamento objeto-relacional, permitindo a execução através de instruções SQL.

A arquitetura da base de dados do sistema foi desenvolvida com o objetivo de suportar todo o ciclo de vida das ocorrências e respetivos relatórios técnicos, garantindo simultaneamente consistência, rastreabilidade e controlo de acessos. O modelo de dados encontra-se dividido nos seguintes grupos funcionais:

- Gestão de utilizadores e autenticação;
- Gestão de ocorrências;
- Gestão de evidências e intervenientes;
- Gestão de relatórios;
- Gestão documental e armazenamento auxiliar.

A estrutura relacional foi complementada pela utilização de atributos do tipo JSONB, permitindo armazenar informação dinâmica e adaptável a diferentes ramos de seguro e tipos de ocorrência.

---

## Testes e Validação

A fiabilidade e resiliência do *backend* são asseguradas através de testes automáticos tirando partido do ecossistema do *Spring Boot* e da linguagem *Kotlin*. O processo de desenvolvimento integrou a criação de testes unitários de integração para a validação do comportamento isolado e integrado de cada uma das camadas da arquitetura.

Numa primeira fase, foram testados os repositórios em memória, permitindo validações de persistência de forma independente da camada da base de dados. Assim, esta abordagem permitiu a correção do comportamento dos repositórios e das estruturas de dados associadas.

De seguida, foram realizados testes à camada de serviços, com o objetivo de validar a lógica de negócio da aplicação. Nesta fase, os serviços foram testados de forma isolada. Com estes testes, conseguimos verificar as regras de validação, coerência de dados e o correto funcionamento de operações mais complexas que envolvem múltiplas entidades.

Por fim, foram efetuados testes à camada dos *controllers*, com foco na validação dos *endpoints* da API. Estes testes permitiram confirmar o correto processamento dos pedidos HTTP, incluindo a serialização e desserialização de dados em JSON, bem como a devolução dos códigos de resposta adequados às diferentes operações.

Com isto, podemos validar cada camada de forma isolada, garantindo que a integração entre componentes ocorre de forma consistente e previsível.

---

## Estrutura do Diretório

<pre>
backend/
├── docs/        # Documentação relacionada com o backend
│   └── <a href="./docs/README.md">README.md</a>
│   └── ...
├── app/         # Configuração da aplicação, infraestrutura e ponto de entrada
│   └── <a href="./app/README.md">README.md</a>
│   └── ...
├── http/        # Controladores HTTP da API
│   └── <a href="./http/README.md">README.md</a>
│   └── ...
├── service/     # Serviços da aplicação e lógica de negócio
│   └── <a href="./service/README.md">README.md</a>
│   └── ...
├── repo/        # Abstrações da camada de acesso a dados
│   └── <a href="./repo/README.md">README.md</a>
│   └── ...
└── domain/      # Camada de domínio da aplicação
    └── <a href="./domain/README.md">README.md</a>
    └── ...
</pre>
