# App

Esta camada concentra toda a configuração do servidor, sendo responsável pela sua inicialização, integração entre componentes e definição da infraestrutura necessária ao funcionamento do sistema.

No contexto do *Spring Boot*, esta camada inclui as classes de configuração, mecanismos de segurança e definição de componentes globais utilizados pelas restantes camadas da aplicação.

Esta camada é responsável pela definição de mecanismos de autenticação e autorização, através da configuração de filtros e *interceptors* utilizados no processamento dos pedidos HTTP. Estes componentes permitem validar credenciais, verificar permissões de acesso e controlar o fluxo de execução antes da invocação dos *controllers*.
