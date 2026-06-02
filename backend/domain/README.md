# Domain

A camada de domínio define o modelo de domínio da aplicação, contendo as entidades e estruturas de dados que representam a lógica de negócio. 

O desenvolvimento desta camada tira partido das características da linguagem *Kotlin*, nomeadamente através da utilização de *data classes*. Estas estruturas permitem a criação de modelos de dados imutáveis, sendo utilizadas para representar as entidades centrais do sistema, tais como ocorrências, relatórios, evidências, intervenientes e utilizadores.

Para além das entidades estruturais, esta camada recorre a tipos enumerados (*enum classes*), fundamentais para a representação de estados e categorizações controladas pelo negócio, tais como os estados do ciclo de vida de um relatório (`ReportStatus`) ou a importância das ocorrências (`OccurrenceType`).

Esta camada integra também comportamentos estruturais e abstrações independentes da infraestrutura, como é o caso da gestão de segurança e *tokens*, onde estão definidos não só os modelos dos *tokens*, mas também a interface `TokenEncoder` e a sua respetiva implementação criptográfica (`Sha256TokenEncoder`). As credenciais de acesso e os *tokens* são armazenados exclusivamente sob a forma de valores *hash*, gerados por funções criptográficas unidirecionais. Este procedimento impossibilita a recuperação de dados em texto claro e assegura que a privacidade dos utilizadores é mantida.
