# Frontend

Este diretório reúne as aplicações cliente do sistema, projetadas para suportar um ecossistema multiplataforma dividido numa aplicação _desktop_ e numa aplicação móvel, que se interligam partilhando um núcleo comum de lógica, estrutura de dados e comunicação.

---

## Arquitetura e Tecnologias

Para satisfazer os requisitos da aplicação e facilitar a manutenção a longo prazo, optou-se pela utilização da linguagem _TypeScript_, cuja capacidade de tipagem estática acrescenta robustez, previsibilidade e rigor à estrutura do código, minimizando falhas em tempo de execução.

A interface gráfica foi construída com base na biblioteca _React Native_, decisão que viabilizou o desenvolvimento em paralelo das vertentes _desktop_ e móvel. A repartição do desenvolvimento por duas tecnologias distintas — _Expo_ para a vertente móvel e _Electron_ para a vertente _desktop_ — permitiu tirar partido do melhor de cada ambiente sem comprometer a reutilização de código.

Em virtude destas escolhas tecnológicas, o código do _frontend_ encontra-se estruturado e delimitado em três áreas lógicas distintas:

- **`commons/`** — Elementos partilhados entre plataformas (modelos, API, utilitários e recursos multimédia);
- **`desktop/`** — Aplicação _desktop_, construída com _Electron_;
- **`movel/`** — Aplicação móvel, construída com _Expo_.

<p align="center">
  <img src="pictures/DiagramaFrontend.png" alt="Arquitetura do Frontend" width="850">
</p>

### Separação do Desenvolvimento em Expo e Electron

Apesar de partilharem a mesma base tecnológica (_React Native_ e _TypeScript_), o desenvolvimento foi realizado em duas tecnologias distintas, dada a diferença de objetivos e de ambiente de execução de cada vertente.

A aplicação móvel destina-se a ser utilizada no terreno, exigindo acesso a funcionalidades nativas do dispositivo, como a câmara, o armazenamento local e a deteção do estado da rede. A plataforma _Expo_ foi selecionada por simplificar o desenvolvimento e a compilação multiplataforma para _Android_ e _iOS_, abstraindo a configuração de baixo nível da infraestrutura nativa.

A aplicação _desktop_ destina-se a tarefas de gestão e de revisão num ambiente de computador (_Windows_, _macOS_ ou _Linux_). O _Electron_ foi escolhido por permitir executar tecnologias _web_ num ambiente isolado, integrando o motor _Chromium_ e o _Node.js_. Uma vez que o _Electron_ não é compatível, de forma direta, com o ecossistema nativo do _React Native_, recorreu-se à biblioteca _React Native for Web_ como camada de adaptação.

A opção por duas tecnologias, em vez de um único sistema de desenvolvimento, justifica-se pela inexistência de uma solução que respondesse, de forma equilibrada, às duas vertentes: uma abordagem exclusivamente em _Expo_ não oferece suporte estruturado a aplicações _desktop_, e uma abordagem exclusivamente em _Electron_ não disponibiliza acesso direto às funcionalidades nativas dos dispositivos móveis. Ao adotar a tecnologia mais adequada a cada vertente e ao concentrar a lógica partilhada no módulo `commons`, alcançou-se o melhor dos dois ambientes, sem comprometer a reutilização de código entre as aplicações.

---

## Ecrãs e Navegação

Uma vez que as aplicações _desktop_ e móvel partilham a mesma base de código, a maioria dos ecrãs é comum a ambas, existindo apenas um ecrã exclusivo da aplicação _desktop_ (o de gestão do relatório de averiguação).

Os ecrãs encontram-se agrupados em duas zonas de acesso distintas: uma de acesso público (_Guest Only_), disponível a qualquer utilizador não autenticado, e outra de acesso restrito (_User Only_), acessível apenas após o início de sessão.

A zona pública inicia-se no ecrã de carregamento (_Loading Screen_), que verifica o estado de autenticação do utilizador, encaminhando-o para o ecrã principal (_Home Screen_) ou, caso já exista sessão ativa, diretamente para o ecrã de ocorrências. A partir do ecrã principal é possível aceder aos ecrãs informativos _About_ e _Contacts_, bem como aos ecrãs de registo e de início de sessão.

Na zona restrita, a navegação entre os principais domínios do sistema é assegurada por uma barra de navegação persistente, que disponibiliza o acesso aos ecrãs de intervenientes, estatísticas, ocorrências, documentos e perfil. A partir do ecrã de uma ocorrência é possível aceder aos respetivos intervenientes, evidências e, na aplicação _desktop_, ao relatório de averiguação.

<p align="center">
  <img src="pictures/DiagramaEcras.png" alt="Diagrama de ecrãs do sistema" width="850">
</p>

---

## Mecanismo de Formulários Dinâmicos

Com o objetivo de construir os formulários de forma flexível, foi desenvolvido um mecanismo de formulários dinâmicos baseado em definições JSON, permitindo que tanto a aplicação _desktop_ como a aplicação móvel utilizem a mesma estrutura lógica e funcional.

O mecanismo suporta diferentes tipos de campos (texto simples e multilinha, campos numéricos, datas, seletores de opções, campos booleanos e _upload_ de ficheiros e imagens), sendo cada um renderizado através de um componente genérico que interpreta o tipo do campo e apresenta o componente gráfico correspondente.

Para aumentar a flexibilidade do sistema, foi implementado suporte para secções e campos repetitivos, gerados dinamicamente consoante os valores introduzidos pelo utilizador, bem como preenchimento automático de dados a partir de informação já existente no sistema (por exemplo, ao selecionar um interveniente).

Cada secção do formulário pode ser persistida individualmente: os dados introduzidos são serializados para ficheiros JSON e armazenados juntamente com os respetivos anexos, o que possibilita a recuperação parcial do formulário, atualizações incrementais, a sincronização entre dispositivos e a redução do risco de perda de informação.

---

## Internacionalização (i18n)

A solução suporta múltiplos idiomas (português, inglês e espanhol), através de duas frentes complementares.

A primeira incide sobre a interface das aplicações: com recurso à biblioteca _i18next_, todo o texto visível ao utilizador é mapeado através de chaves de tradução, resolvidas em tempo de execução com base no idioma ativo. O sistema deteta e assume automaticamente o idioma do sistema operativo.

A segunda foca-se no mecanismo de formulários dinâmicos: as etiquetas dos títulos das secções e dos campos são estruturadas no próprio ficheiro JSON como objetos multilíngua, eliminando a necessidade de manter estruturas de dados distintas para cada idioma.

---

## Download de Ficheiros e Imagens

O _download_ de ficheiros e imagens, nomeadamente de evidências e documentos de apoio, é gerido pelo _backend_ através de _endpoints_ dedicados. A lógica de comunicação encontra-se definida de forma centralizada no módulo `commons`, sendo a gravação do ficheiro delegada num _handler_ específico de cada plataforma. Em ambos os casos, o nome do ficheiro é determinado a partir do cabeçalho `Content-Disposition` da resposta HTTP, com a extensão inferida a partir do tipo MIME quando necessário.

Na aplicação _desktop_, o ficheiro é obtido através de um pedido HTTP, convertido num objeto _blob_ e descarregado através de um elemento de ligação dinâmico. Na aplicação móvel, o _download_ recorre à biblioteca `react-native-blob-util`, guardando o ficheiro na pasta de transferências no _Android_ ou no diretório de documentos da aplicação no _iOS_.

---

## Testes

Recorreu-se ao executor de testes _Jest_ para testar de forma isolada os componentes visuais, os _hooks_ e a camada de infraestrutura, tanto na aplicação _desktop_ como na móvel, garantindo que os componentes renderizam corretamente, que a lógica de estado e de acesso a dados se comporta como esperado e que os mecanismos de armazenamento local funcionam de forma fiável.

---

## Documentação do Código

O código do _frontend_ encontra-se documentado ao nível do próprio código-fonte recorrendo a _TSDoc_, a convenção de documentação da linguagem _TypeScript_. Os componentes, _hooks_ e funções utilitárias incluem comentários estruturados que descrevem o seu propósito, parâmetros e valores devolvidos, contribuindo para a legibilidade e a manutenibilidade do código partilhado entre as aplicações _desktop_ e móvel.

---

## Estrutura do Diretório

<pre>
frontend/
├── commons/     # Lógica, modelos e recursos partilhados entre plataformas
│   └── <a href="./commons/README.md">README.md</a>
│   └── ...
├── desktop/     # Aplicação desktop (Electron)
│   └── <a href="./desktop/README.md">README.md</a>
│   └── <a href="./desktop/INSTRUCTIONS.md">INSTRUCTIONS.md</a>
│   └── ...
├── movel/       # Aplicação móvel (Expo)
│   └── <a href="./movel/README.md">README.md</a>
│   └── <a href="./movel/INSTRUCTIONS.md">INSTRUCTIONS.md</a>
│   └── ...
└── __tests__/   # Testes Jest às três áreas do frontend
</pre>
