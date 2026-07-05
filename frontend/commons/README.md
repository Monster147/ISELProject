# Commons

Com o objetivo de maximizar a eficiência do desenvolvimento, a arquitetura do _frontend_ adota uma estratégia de reaproveitamento de componentes. Este módulo centraliza as interfaces lógicas, os serviços e as definições de dados partilhadas entre as aplicações _desktop_ e móvel, isolando-as por completo das plataformas consumidoras. Este desacoplamento elimina a redundância de código nas aplicações cliente, estruturando-se em quatro pilares fundamentais.

---

## Tipagem e Modelos de Domínio (`models`)

Responsável pelo encapsulamento de todas as representações tipadas dos modelos lógicos partilhados pela API. Aproveitando o ecossistema _TypeScript_, foram definidas estruturas, tipos e interfaces adequadas a cada domínio de negócio do sistema, como a representação de utilizadores (`user`), a arquitetura das ocorrências (`occurrence`), dos relatórios (`report`) e das estatísticas (`stats`). Ao centralizar estes modelos, garante-se que tanto a aplicação móvel como a versão _desktop_ utilizam exatamente a mesma estrutura de dados fornecida pelo _backend_.

## Camada de Integração e Comunicação (`api`)

A fim de uniformizar a comunicação com o _backend_, centralizou-se o acesso HTTP neste diretório, concretizado através do ficheiro `api.ts`. Este componente é o responsável primário por fornecer o cliente e as instâncias das rotas, estabelecendo globalmente os métodos base (_Base URLs_) e injetando as configurações de cabeçalhos (_headers_) necessárias. Esta centralização beneficia a manutenibilidade do sistema, uma vez que qualquer modificação na estrutura dos pedidos HTTP é imediatamente propagada de forma uniforme para todos os componentes dependentes.

## Funções Utilitárias e Constantes do Sistema (`utils` e `constants`)

De modo a garantir que as funções de processamento isolado ou de formatação da informação não sobrecarregam a lógica visual dos ecrãs, as mesmas foram realizadas no subdiretório `utils`. Destaca-se a presença de utilitários de tratamento temporal, como o `dateFormater.ts`, para converter as marcas de tempo provenientes da API nos requisitos de leitura da interface de utilizador.

Paralelamente, o subdiretório `constants` agrupa valores imutáveis do sistema, como o ficheiro `Colors.ts`, que centraliza os esquemas de cores da aplicação, assegurando a consistência da identidade visual e suportando a transição entre diferentes temas ou estados do ecossistema a partir de um repositório partilhado.

## Centralização de Recursos Multimédia (`img`)

Os recursos multimédia estáticos, comuns a ambas as aplicações, encontram-se centralizados neste módulo de partilha. Ficheiros essenciais à identidade institucional do sistema, como o logótipo oficial do ISEL (`isel.png`), encontram-se aqui reunidos. Esta abordagem minimiza a duplicação de ficheiros e otimiza o armazenamento, reduzindo o tamanho final dos pacotes gerados no processo de compilação (_build_).

## Componentes Comuns (`components`)

Este subdiretório agrupa os componentes de interface que não dependem de implementações específicas de cada plataforma, permitindo a sua reutilização tanto na aplicação _desktop_ como na móvel. Por assentarem nas primitivas do _React Native_, estes componentes são renderizados de forma coerente em ambos os ambientes, contribuindo para uma identidade visual uniforme.

## Outros Módulos Partilhados

Complementarmente aos pilares descritos, este diretório inclui ainda:

- **`errors/`** — Estruturas comuns para o tratamento e representação de erros devolvidos pela API;
- **`i18next/`** — Configuração base e ficheiros de tradução (`locales`) partilhados pela internacionalização das aplicações.
