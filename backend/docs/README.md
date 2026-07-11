# Documentação

O presente diretório centraliza os documentos formais de especificação e desenho do sistema, os contratos de comunicação, a modelação arquitetural, a representação estrutural da base de dados e a padronização das respostas de erro do ecossistema.

A estrutura deste diretório encontra-se dividida nos seguintes eixos principais:

- **`http-api.yaml`** — Contém a especificação técnica da API REST, desenvolvida sob a norma _OpenAPI_. Este documento constitui o contrato formal de comunicação do sistema, documentando os _endpoints_ disponíveis, os parâmetros exigidos nas requisições, as estruturas de dados das respostas e os respetivos esquemas de autenticação.

- **`diagrams/`** — Agrupa as representações visuais da arquitetura do sistema e do seu modelo de dados. Inclui os diagramas de Entidade-Associação (EA) que ilustram as relações relacionais na base de dados _PostgreSQL_, diagramas focados em cada modelo de negócio (como ocorrências, evidências, relatórios e intervenientes) e o mapeamento conceptual das camadas do servidor e do fluxo de informação.

- **`problems/`** — Diretório dedicado à enumeração e especificação estática dos identificadores de erros de negócio (tais como `email-already-in-use`, `occurrence-not-found` ou `user-not-admin`). Estes ficheiros servem de base para a construção das respostas da API, garantindo que as aplicações cliente recebem exceções uniformizadas, tipificadas e de fácil compreensão.

- **`forms/`** — Armazena os documentos (como o `accident-form.json`) que definem a estrutura e os campos dos formulários a serem preenchidos pelo averiguador de sinistros.

---
