# Desktop

A vertente para computador do sistema foi concebida para oferecer uma experiência nativa aos utilizadores, tirando partido das capacidades dos sistemas operativos tradicionais (_Windows_, _macOS_ ou _Linux_), destinando-se a tarefas de gestão e de revisão do trabalho realizado no terreno.

Para o efeito, a arquitetura deste módulo assenta no _framework Electron_, servindo como um ambiente de execução híbrido que integra o motor de navegação _Chromium_, para a apresentação da interface gráfica, e o _Node.js_, para o processamento e acesso nativo ao sistema.

---

## Integração com React Native

O desafio principal na adoção de uma arquitetura baseada em _React Native_ prende-se com o reaproveitamento de código e componentes no ambiente _desktop_. Devido à incompatibilidade estrutural entre o motor de renderização do _Electron_, assente em _Chromium_, e o ecossistema nativo do _React Native_, a sua integração direta revela-se inviável.

Para resolver esta limitação, implementou-se uma configuração estratégica no _bundler Vite_ (através do ficheiro `vite.config.ts`), integrando a biblioteca _React Native for Web_ (`react-native-web`). Esta ferramenta atua como uma camada de adaptação, convertendo as propriedades e _tags_ exclusivas do _React Native_ (como `<View>`, `<Text>` ou `<TextInput>`) nos elementos do _Document Object Model_ (DOM) do HTML, em tempo de compilação. Sem este mecanismo de adaptação no processo de empacotamento, seria impossível uniformizar os mesmos blocos visuais das plataformas móveis para o ambiente _desktop_.

Caso o objetivo futuro do projeto passe por gerar binários _desktop_ nativos, como executáveis `.exe` para _Windows_ ou pacotes `.app` para _macOS_, com otimização máxima de desempenho, recomenda-se a substituição do _Electron_ pela adoção direta de soluções dedicadas, nomeadamente o _React Native Windows_ ou o _React Native macOS_.

---

## Estrutura Interna

A estrutura do _Electron_ divide-se em dois processos fundamentais, refletidos na organização do código gerado e no diretório `src/electron`:

- **Processo Principal (_Main Process_)** — Responsável pela gestão do ciclo de vida da aplicação, criação de janelas e interação de baixo nível com o sistema operativo. A sua compilação é separada no diretório `dist-electron`, incorporando ficheiros essenciais como o `main.js` e o `preload.cjs`, sendo este último responsável por estabelecer o canal seguro de comunicação interprocessos (IPC) entre a interface isolada e o processo principal.
- **Processo de Renderização (_Renderer Process_)** — Atua como o contexto de interface visual do utilizador. O resultado compilado das páginas e componentes _React_ é injetado no contexto nativo (`index.html`) e alojado no diretório `dist-react`.

Para preparar a versão final de distribuição, o projeto recorre às diretrizes do ficheiro `electron-builder.json`. Esta configuração é responsável por compilar a aplicação e gerar os instaladores adaptados, associando-lhes desde logo os recursos gráficos estipulados (como o ícone principal em `desktopIcon.png`).

Para além das configurações estruturais, este módulo contém os blocos modulares que dão vida à interface interativa:

- **Inicialização e Roteamento (`main.tsx` e `router.tsx`)** — O ficheiro `main.tsx` atua como o ponto de entrada do processo de renderização, sendo responsável por injetar a árvore da aplicação _React_ no DOM. Em paralelo, a orquestração da navegação e as transições entre os diversos ecrãs do sistema centralizam-se no ficheiro `router.tsx`, cuja responsabilidade abrange o mapeamento dos caminhos de navegação e a imposição das respetivas políticas de segurança.
- **Gestão de Estado e Comunicação (`contexts/`)** — Além de mitigar o encaminhamento manual de propriedades e garantir o acesso global a dados partilhados (como a sessão do utilizador) através da _Context API_, esta camada atua como o motor de operações de domínio, encapsulando a lógica funcional dos serviços, desde a orquestração de pedidos assíncronos à API e respetiva persistência de dados, até ao estabelecimento e gestão de ligações ativas em tempo real, como é o caso dos _Server-Sent Events_ (SSE).
- **Infraestrutura (`infrastructure/`)** — Diretório destinado à gestão do armazenamento local de dados. Ao centralizar as operações de persistência e o acesso à memória no ambiente do computador, esta camada promove o total desacoplamento entre os elementos visuais e os mecanismos físicos de gravação da informação.
- **Componentes e Tematização (`components/`)** — Um conjunto de elementos visuais _Themed_ (como `ThemedDateInput.tsx`, `ThemedLoader.tsx`, entre outros) desenvolvidos para garantir uma identidade visual coesa e responsiva no ambiente _desktop_.
- **Ciclo de Vida e Segurança de Estado (`hooks/`)** — Diretório que centraliza os _hooks_ personalizados, atuando em duas vertentes. Por um lado, disponibiliza pontos de acesso seguro aos contextos globais da aplicação (como o `useAuth.tsx` ou o `useDocument.tsx`), implementando uma abordagem defensiva que lança exceções imediatas caso o estado seja acedido fora do respetivo _Provider_, o que previne falhas silenciosas. Por outro lado, encapsula mecanismos de monitorização contínua _listeners_ (como o `useOccurrencesListener.ts`), que evitam consumos indevidos de memória e processam atualizações da API, assegurando a re-renderização imediata das interfaces afetadas.
- **Camada de Apresentação e Estrutura Visual (`src/ui/app`)** — Centraliza todos os ecrãs e componentes gráficos que constituem a interface de utilizador. A sua organização interna obedece a uma lógica de segmentação por domínios, isolando as zonas de acesso público (subdiretório `(auth)`) das áreas restritas de gestão e visualização (agrupadas em `(dashboard)`), incluindo ainda os _layouts_ estruturais.
- **Internacionalização (`i18next/`)** — Diretório que centraliza a configuração de tradução e localização da aplicação.

Esta separação estrutural não só facilita a correção de aspetos de usabilidade e a introdução de melhoramentos visuais, como também assegura uma elevada _performance_. Ao isolar a lógica, garante-se que a interface do utilizador se mantém fluida e responsiva, enquanto as operações mais exigentes de comunicação com a API decorrem de modo assíncrono e independente.

---

## Babel e Metro

Apesar de a aplicação _desktop_ ser empacotada pelo _Vite_, mantêm-se ainda os ficheiros `babel.config.js` e `metro.config.js`, herdados do ecossistema _React Native_, necessários para que o código partilhado com a aplicação móvel continue a ser interpretado e resolvido corretamente.

O **Babel** é responsável por transpilar o código _TypeScript_ para _JavaScript_. Utiliza-se o _preset_ `babel-preset-expo`, que garante a compatibilidade da sintaxe do _React Native_ com o restante ecossistema _JavaScript_, complementado pelo _plugin_ `module-resolver`. Este _plugin_ permite a utilização de _aliases_ de importação (como `@commons`, `@components`, `@contexts`, `@hooks`, `@infrastructure` e `@utils`), evitando caminhos relativos extensos e pouco legíveis nas importações entre módulos.

O **Metro**, por sua vez, é o _bundler_ nativo do _React Native_, responsável por compor o código-fonte num único pacote. Ainda que o processo de compilação final da aplicação _desktop_ seja assegurado pelo _Vite_, esta configuração mantém-se relevante durante o desenvolvimento, uma vez que replica, através de `extraNodeModules`, o mapeamento dos mesmos _aliases_ definidos no Babel, e regista a pasta `../commons` em `watchFolders`, assegurando que as alterações efetuadas no código partilhado são corretamente vigiadas e refletidas.

Esta configuração garante, assim, que a aplicação _desktop_ consegue resolver, de forma consistente com a aplicação móvel, as importações do código partilhado no módulo `commons`, mesmo operando sobre uma cadeia de compilação distinta (_Vite_ em vez de _Metro_).

---

## Ecrã Exclusivo

Ao contrário dos restantes ecrãs, partilhados com a aplicação móvel, o ecrã do relatório de averiguação (`src/ui/app/(dashboard)/occurrences/report/[id].tsx`) é exclusivo desta aplicação, destinando-se à gestão do relatório: criação, atualização, _download_ e submissão.
