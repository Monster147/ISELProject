# Móvel

A vertente móvel do sistema foi projetada para atuar como uma ferramenta ágil no terreno, garantindo a estabilidade e a usabilidade do serviço mesmo em cenários de inexistência de conectividade. Para o efeito, a arquitetura deste módulo baseia-se na conjugação da biblioteca _React Native_ com o _framework Expo_, utilizando _TypeScript_ como linguagem base para assegurar consistência e promover uma maior robustez no desenvolvimento.

---

## Expo e Navegação Baseada em Ficheiros

Com o intuito de impulsionar a agilidade no desenvolvimento e simplificar a integração de _TypeScript_ com as plataformas nativas (_Android_ e _iOS_), a aplicação móvel foi estruturada sobre o ecossistema _Expo_. A adoção deste _framework_ garante um nível de abstração que dispensa a intervenção direta em ficheiros de configuração da infraestrutura base, como o _Gradle_, orquestrando ainda todo o ciclo de geração de executáveis (_builds_) e fornecendo APIs otimizadas para interagir com o ecossistema do dispositivo, como o armazenamento local e as interfaces de rede.

Afastando-se da abordagem convencional baseada na configuração explícita de rotas, a aplicação móvel adota o paradigma do _Expo Router_, estruturando a sua navegação através da própria organização do sistema de ficheiros (_file-based routing_), centralizada no diretório `app/`. Neste ecossistema, os ficheiros identificados como `_layout.tsx` atuam como componentes estruturais persistentes, gerindo elementos partilhados entre ecrãs, como as barras de navegação, o que elimina a necessidade de declarar e mapear rotas manualmente em ficheiros centralizados.

---

## Estrutura Interna

De forma a facilitar a escalabilidade e maximizar a familiaridade estrutural para futuras manutenções, a organização deste diretório partilha a mesma ideologia arquitetural utilizada na aplicação _desktop_:

- **Camada de Apresentação e Estrutura Visual (`app/`)** — Representa o núcleo da interface com o utilizador. A sua segmentação interna isola as zonas de acesso público (subdiretório `(auth)`) da área estritamente operacional e de gestão do sistema (agrupadas em `(dashboard)`). Além do mapeamento visual, estes ecrãs incorporam a lógica local de apresentação, o processamento da entrada de dados por parte do utilizador e a resposta direta aos eventos acionados.
- **Gestão de Estado, Comunicação e Sincronização (`contexts/`)** — Utiliza a _Context API_ do _React_ como motor transacional e para a partilha de estados globais entre componentes. Destaca-se o `OfflineSyncContext.tsx`, responsável por reter as operações geradas pelos restantes contextos de domínio (como Entidades e Intervenientes) durante falhas e falta de conexão, executando mecanismos em segundo plano para a ressincronização com o servidor assim que a conectividade é restabelecida.
- **Componentes e Tematização (`components/`)** — Repositório para os elementos modulares e interativos da interface. Componentes gráficos que dependem de elementos específicos da aplicação móvel, como campos de introdução de dados e alertas visuais (identificados com o prefixo `Themed...`, como `ThemedOfflineBanner.tsx` ou `ThemedDateInput.tsx`), encontram-se isolados neste diretório, assegurando a coesão visual da aplicação e a adaptação dinâmica a diferentes temas (claro e escuro).
- **Infraestrutura e Armazenamento (`infrastructure/`)** — Diretório dedicado à gestão da persistência local de dados. À semelhança da aplicação _desktop_, a centralização das operações de escrita e leitura promove o desacoplamento total entre os elementos visuais e os mecanismos de armazenamento. Destaca-se a adoção da biblioteca _SecureStore_, utilizada para o armazenamento encriptado de dados críticos, como os _tokens_ de sessão, e da biblioteca _AsyncStorage_, utilizada para o armazenamento persistente de dados de menor sensibilidade.
- **Ciclo de Vida e Segurança de Estado (`hooks/`)** — Consolida as abstrações lógicas que garantem a reatividade e a proteção de dados, reaproveitando as metodologias de injeção defensiva de estado através de _hooks_ (como o `useAuth.tsx` e o `useDocument.tsx`) e os mecanismos baseados no padrão _Observer_ para monitorização contínua (_listeners_, como o `useOccurrencesListener.ts`). O elemento diferenciador deste diretório reside na inclusão de componentes responsáveis por interagir com o ciclo de vida e com a interceção de eventos e botões físicos do dispositivo (como o `useAlertExitApp.tsx`).
- **Internacionalização (`i18next/`)** — À semelhança da aplicação _desktop_, centraliza a tradução e localização do sistema.

Este isolamento concetual garante a modularidade e a manutenibilidade do código-fonte para futuras atualizações, assegurando a priorização da usabilidade da aplicação. As operações de maior latência ou processamento intensivo são realizadas de forma assíncrona ao nível do estado e dos contextos, prevenindo que eventuais estrangulamentos (_bottlenecks_) de comunicação nativa bloqueiem a _thread_ de interface no dispositivo do utilizador.

---

## Babel e Metro

Ao contrário da aplicação _desktop_, na aplicação móvel o **Metro** é o próprio _bundler_ utilizado pelo _Expo_ para compor e empacotar o código-fonte, não havendo aqui uma ferramenta intermédia como o _Vite_.

O **Babel** é responsável por transpilar o código _TypeScript_ para _JavaScript_, recorrendo ao _preset_ `babel-preset-expo`, que assegura a compatibilidade da sintaxe do _React Native_ com o restante ecossistema. A este preset associa-se o _plugin_ `module-resolver`, que permite a utilização de _aliases_ de importação (`@commons`, `@components`, `@contexts`, `@hooks`, `@infrastructure` e `@utils`), simplificando as importações entre módulos e evitando caminhos relativos extensos.

A configuração do **Metro** complementa esta abordagem, replicando o mapeamento dos mesmos _aliases_ através de `extraNodeModules`, o que garante que o _bundler_ resolve corretamente os módulos identificados por estes atalhos. Adicionalmente, esta configuração regista a pasta `../commons` em `watchFolders`, assegurando que o Metro vigia também as alterações efetuadas no código partilhado com a aplicação _desktop_, e define explicitamente o caminho dos `node_modules` da aplicação através de `nodeModulesPaths`, uma vez que a estrutura do repositório, ao partilhar código fora da raiz do projeto móvel, exige esta indicação explícita para que a resolução de dependências funcione corretamente.

Em conjunto, estas configurações permitem que a aplicação móvel utilize, de forma transparente, o código definido no módulo `commons`, apesar de este se encontrar fisicamente fora do diretório da própria aplicação.

---

## Mecanismo de Sincronização

Com o objetivo de reduzir o impacto da inexistência de conexão e de criar um suporte _offline_ completo, a arquitetura da aplicação foi realizada de modo a assegurar a resiliência e a continuidade operacional dos averiguadores no terreno.

Qualquer transação de escrita realizada em casos de inexistência de conectividade, incluindo a adição de evidências, a criação e atualização de intervenientes ou a adição de intervenientes numa ocorrência, é armazenada localmente pelo sistema, garantindo a integridade dos dados recolhidos e eliminando o risco de perda de informação.

No momento em que o sistema identifica a ausência de conectividade através do _hook_ de escuta `useNetworkStatus.ts`, que mantém o estado `isOnline`, a aplicação assegura a continuidade operacional sem descartar as alterações efetuadas. O processo de submissão passa a ser executado em modo _offline_, e todos os pedidos submetidos são retidos localmente pelo gestor de fila implementado no `OfflineSyncContext.tsx`.

Após a conectividade à rede ser restabelecida, o `useNetworkStatus.ts` deteta a alteração do estado `isOnline`, ativando o método de sincronização, que executa a sincronização em três etapas, pela seguinte ordem:

1. Criação e atualização dos intervenientes efetuadas em modo _offline_;
2. Adição e remoção de intervenientes das ocorrências realizadas em modo _offline_;
3. Adição, atualização e remoção de evidências de uma ocorrência realizadas em modo _offline_.

Por cada ação armazenada localmente, o sistema tenta executar a respetiva operação no servidor. Caso seja bem-sucedida, a ação é removida da fila; caso contrário, a ação só é mantida na fila se ocorrer uma falha no servidor (_status code_ 5xx), sendo reagendada através de um mecanismo de retentativa progressiva que aumenta o tempo de espera entre tentativas com base no número de tentativas já efetuadas. Se o limite máximo de tentativas for atingido, a ação é removida da lista, para evitar bloqueios no processo de sincronização e garantir a continuidade das restantes ações.

### Persistência e Resolução de Conflitos

A fonte de verdade do sistema é a base de dados centralizada no servidor. Por essa razão, numa operação de criação, os dados que efetivamente persistem são aqueles que ficam registados na base de dados, e não as cópias locais retidas em cada dispositivo durante o período _offline_.

Esta distinção é relevante em cenários de concorrência: caso dois averiguadores, ambos em modo _offline_, criem o mesmo interveniente e, posteriormente, fiquem em linha em simultâneo, ocorre uma condição de corrida (_race condition_), em que ambos os pedidos de criação são enviados para o servidor, mas apenas o primeiro a ser processado é efetivamente persistido. O segundo pedido é rejeitado pelo servidor através de um erro do lado do cliente (_status code_ 4xx) e, como apenas as falhas do servidor (5xx) são reagendadas, esta ação não é repetida, sendo removida da fila.

Por fim, o processo é resiliente a falhas de conectividade: caso a ligação à rede falhe a meio da sincronização, nenhum dado é perdido, uma vez que as ações cuja sincronização não chegou a ser confirmada permanecem na fila local e serão novamente processadas assim que a conectividade for restabelecida.
