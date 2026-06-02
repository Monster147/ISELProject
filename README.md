# Insurance Reporter App

> Projeto Final de Curso — ISEL 2025/26

---

## Enquadramento

Nos últimos anos, tem-se verificado um aumento da necessidade de averiguação de sinistros, nomeadamente sinistros laborais, rodoviários e resultantes de catástrofes naturais. As seguradoras enfrentam a necessidade de enviar averiguadores ao local da ocorrência no processo de averiguação de um sinistro, sendo necessário recolher um conjunto diversificado de elementos, incluindo fotografias, descrições técnicas, medições e declarações dos intervenientes. Com o aumento da complexidade das ocorrências e da exigência de decisões rigorosas, a utilização de métodos tradicionais, como bloco de notas ou gravador, mesmo com o apoio de *smartphone*, poderá não ser a solução mais adequada, dado estar sujeita a erros, perdas de informação e dificuldades na organização dos dados.

---

## Objetivos

O projeto *Insurance Reporter App* visa a modernização, automatização e simplificação deste processo, através de uma aplicação móvel, complementada por uma aplicação *desktop*. Estas aplicações, móvel e *desktop*, têm como principal objetivo apoiar o averiguador na recolha dos diversos elementos necessários, através de um documento padrão, designado relatório de averiguação. Simultaneamente, pretende-se facilitar a análise por parte da seguradora ou entidade responsável, de forma a permitir uma decisão documentada e célere.

Para a realização do projeto foram definidos os seguintes requisitos:

- O sistema deve permitir criar relatórios de averiguação para os diferentes tipos de sinistros;
- Os dados devem ser centralizados numa base de dados, de forma a garantir a sua integridade;
- As aplicações, *desktop* e móvel, devem:
  - Permitir o registo de fotografias, vídeos e medições relacionadas com o sinistro;
  - Ser operacionais mesmo sem conectividade, garantindo o armazenamento seguro dos dados;
  - Permitir aos averiguadores autorizados editar, submeter e gerar o relatório de averiguação;
  - Permitir a exportação dos relatórios em formato PDF, bem como da documentação anexa;
  - Permitir a sincronização automática quando a conectividade estiver disponível, sincronizando os diversos elementos recolhidos com o servidor.

---

## Solução Proposta

A arquitetura proposta estrutura-se num ecossistema multiplataforma, constituído por aplicações cliente direcionadas para ambientes móveis e *desktop*. O sistema viabiliza a gestão do ciclo de vida dos processos de averiguação de sinistros, abrangendo a caracterização da ocorrência, a recolha de evidências, a persistência de dados e a geração automatizada de relatórios em formato PDF.

As aplicações de *frontend* interagem com um *backend* centralizado, que encapsula as regras de negócio e o modelo de domínio (ocorrências, relatórios, evidências e intervenientes). Esta camada assegura o desacoplamento entre componentes, garantindo a integridade e a consistência da informação em todo o sistema. Do lado do cliente encontram-se as aplicações *desktop* (*Windows*, *macOS* e *Linux*) e móveis (*Android* e *iOS*), responsáveis pela interação com o utilizador e pela recolha de informação. Estas aplicações comunicam com o *backend*, desenvolvido em *Spring Boot*, através de uma ligação segura disponibilizada pelo *Ngrok*. O *backend* centraliza a lógica de negócio e estabelece comunicação com a base de dados *PostgreSQL* para persistência dos dados. Os componentes do lado do servidor encontram-se contentorizados com *Docker*, garantindo portabilidade, isolamento e consistência do ambiente de execução.

### Backend

O desenvolvimento do servidor foi realizado em *Kotlin*. A arquitetura da API assenta no *framework Spring*, o que agiliza a gestão de rotas e a implementação de mecanismos de segurança através do seu sistema de anotações. A comunicação com as aplicações cliente é realizada através da ferramenta de rede *Ngrok*, que estabelece um túnel seguro via HTTPS para a exposição pública da API. Dada a natureza crítica e sensibilidade dos dados, os processos de registo e autenticação de utilizadores encontram-se centralizados no *backend*. Esta abordagem garante o controlo de acessos e assegura que todas as validações de segurança são executadas exclusivamente no lado do servidor.

### Base de Dados

No que concerne à persistência dos dados, optou-se pelo sistema de gestão de bases de dados relacional *PostgreSQL*, dada a necessidade de uma arquitetura estruturada que suporte as relações complexas entre entidades. A camada de acesso a dados utiliza a biblioteca JDBI, que simplifica o controlo transacional e otimiza o mapeamento objeto-relacional, permitindo a execução através de instruções SQL.

### Frontend

Relativamente às aplicações cliente, a implementação da interface gráfica e da lógica de negócio baseia-se em *React Native* e *TypeScript*. Esta abordagem permite partilhar uma base de código comum entre a vertente móvel, que utiliza o *framework Expo*, e a vertente *desktop*, que utiliza o *framework Electron*, otimizando o seu desenvolvimento.

---

## Estrutura do Repositório

<pre>
ISELProject/
├── backend/        # API REST, lógica de negócio e base de dados
│   └── <a href="./backend/README.md">README.md</a>   # Documentação detalhada do backend
│   └── ...
│
├── frontend/       # Aplicações cliente móvel e desktop
│   └── <a href="./frontend/README.md">README.md</a>   # Documentação detalhada do frontend
│   └── ...
│
├── documents/      # Documentos de suporte à averiguação
│
└── ...
</pre>

---

## Autores

Projeto Final de Curso — [ISEL](https://www.isel.pt) 2025/26

Desenvolvido em parceria com **CAPT Consulting**.

Orientação: Dr. Artur Ferreira e Dr. Pedro Matutino.
