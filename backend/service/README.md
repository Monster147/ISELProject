# Service

A camada de serviços concentra toda a lógica aplicacional, funcionando como o núcleo operacional do sistema. As classes que compõem esta camada têm como responsabilidade processar os parâmetros recebidos pelos _controllers_, executar as validações de negócio necessárias e coordenar as operações de persistência, invocando para tal os métodos apropriados dos repositórios.

Para a implementação dos serviços, utilizou-se a anotação `@Component` do _framework Spring_. Esta anotação integra as classes no contentor de inversão de controlo (_IoC_) do *Spring*, permitindo que estas sejam instanciadas e geridas automaticamente através de mecanismos de reflexão.

Esta abordagem facilita a injeção de dependências, permitindo que cada serviço receba automaticamente os componentes necessários para o seu funcionamento, como é o caso do `TransactionManager`. Esta integração é vital para a interação com a base de dados _PostgreSQL_, uma vez que permite ao serviço definir o âmbito das transações, garantindo que operações complexas que envolvam múltiplos repositórios sejam executadas de forma atómica e segura.

---

## Geração de Relatórios em PDF

Para além das operações de negócio das entidades, esta camada integra também o componente responsável pela geração padronizada dos relatórios finais. Este módulo recorre à biblioteca _Apache PDFBox_, que permite a criação programática de ficheiros PDF, definindo a estrutura de páginas, o texto, os tipos de letra e a incorporação de imagens.

O componente adota, ainda, dependências do serviço de armazenamento (_StorageService_) necessário para carregar os recursos a serem incluídos e assegura que a geração decorre no idioma pretendido, correspondente à linguagem definida no dispositivo do averiguador.