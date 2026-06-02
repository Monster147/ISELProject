# Controller

O *framework Spring* utiliza uma arquitetura baseada em anotações para a definição e gestão dos *endpoints* da aplicação. A anotação `@RestController` é utilizada para designar uma *class* como um controlador REST, o que indica ao *Spring* que as respostas dos métodos devem ser serializadas diretamente no corpo da resposta HTTP (geralmente em JSON).

Para organizar a estrutura das rotas, utiliza-se a anotação `@RequestMapping` ao nível da classe, estabelecendo o caminho base (*base path*) para todos os recursos nela contidos. A nível de método, a especialização das rotas é feita através de anotações específicas para cada uma delas, tais como `@GetMapping` para operações de leitura, `@PostMapping` para criação, `@PutMapping` para atualizações integrais e `@DeleteMapping` para a remoção de recursos.

O tratamento de dados de entrada é fundamental para a integridade do sistema. Para converter os dados recebidos no corpo de um pedido HTTP em objetos da linguagem *Kotlin*, utiliza-se a anotação `@RequestBody`. Este processo de desserialização é gerido automaticamente pelo *Spring*, que mapeia o conteúdo JSON para instâncias de classes de transferência de dados (DTOs).

Existem, contudo, casos específicos que exigem tratamentos diferenciados:

- `@RequestPart` — Utilizado em pedidos do tipo *multipart/form-data*, permitindo o processamento conjunto de ficheiros (como evidências ou documentos) e metadados associados num único pedido.
- `@PathVariable` — Aplicado quando a informação de identificação do recurso (como o ID de uma ocorrência ou de um relatório) faz parte integrante do próprio caminho do URL.
- `@RequestParam` — Utilizado para capturar parâmetros de consulta (*query parameters*) no URL.
