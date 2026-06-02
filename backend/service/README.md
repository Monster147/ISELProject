# Service

A camada de serviços concentra toda a lógica aplicacional, funcionando como o núcleo operacional do sistema. As classes que compõem esta camada têm como responsabilidade processar os parâmetros recebidos pelos *controllers*, executar as validações de negócio necessárias e coordenar as operações de persistência, invocando para tal os métodos apropriados dos repositórios.

Para a implementação dos serviços, utilizou-se a anotação `@Component` do *framework Spring*. Esta anotação integra as classes no contentor de inversão de controlo (IoC) do *Spring*, permitindo que estas sejam instanciadas e geridas automaticamente através de mecanismos de reflexão.

Esta abordagem facilita a injeção de dependências, permitindo que cada serviço receba automaticamente os componentes necessários para o seu funcionamento, como é o caso do `TransactionManager`. Esta integração é vital para a interação com a base de dados *PostgreSQL*, uma vez que permite ao serviço definir o âmbito das transações, garantindo que operações complexas que envolvam múltiplos repositórios sejam executadas de forma atómica e segura.
