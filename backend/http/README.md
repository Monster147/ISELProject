# Controller

O _framework_ _Spring_ utiliza uma arquitetura baseada em anotações para a definição e gestão dos _endpoints_ da aplicação. A anotação _@RestController_ é utilizada para designar uma _class_ como um controlador _REST_, o que indica ao _Spring_ que as respostas dos métodos devem ser serializadas diretamente no corpo da resposta _HTTP_ (geralmente em _JSON_).

Para organizar a estrutura das rotas, utiliza-se a anotação ```@RequestMapping``` ao nível da classe, estabelecendo o caminho base (_base path_) para todos os recursos nela contidos. A nível de método, a especialização das rotas é feita através de anotações específicas para cada uma delas, tais como ```@GetMapping``` para operações de leitura, ```@PostMapping``` para criação, ```@PutMapping``` para atualizações integrais e ```@DeleteMapping``` para a remoção de recursos.

O tratamento de dados de entrada é fundamental para a integridade do sistema. Para converter os dados recebidos no corpo de um pedido _HTTP_ em objetos da linguagem _Kotlin_, utiliza-se a anotação ```@RequestBody```. Este processo de desserialização é gerido automaticamente pelo _Spring_, que mapeia o conteúdo _JSON_ para instâncias de classes de transferência de dados (_Data Transfer Object_ (_DTO_)).

Existem, contudo, casos específicos que exigem tratamentos diferenciados:

- `@RequestPart` — Utilizado em pedidos do tipo _multipart/form-data_, permitindo o processamento conjunto de ficheiros (como evidências ou documentos) e metadados associados num único pedido.
- `@PathVariable` — Aplicado quando a informação de identificação do recurso (como o _ID_ de uma ocorrência ou de um relatório) faz parte integrante do próprio caminho do URL.
- `@RequestParam` — Utilizado para capturar parâmetros de consulta (_query parameters_) no URL.
