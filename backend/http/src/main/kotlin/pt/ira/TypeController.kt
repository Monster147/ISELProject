package pt.ira

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import pt.ira.model.Problem
import pt.ira.model.type.TypeCreateInput
import pt.ira.model.type.TypeUpdateInput
import pt.ira.publishers.Publishers
import pt.ira.type.Type
import pt.ira.user.AuthenticatedUser

/**
 * Controlador REST responsável pela gestão de tipos.
 *
 * Expõe endpoints HTTP para criação, consulta, atualização e remoção de tipos.
 * Atua como camada de adaptação entre HTTP e o [TypeService].
 *
 * Responsabilidades:
 * - criação de tipos;
 * - consulta por *id* e nome;
 * - listagem de tipos;
 * - atualização e remoção;
 * - mapeamento de erros de domínio para respostas HTTP.
 *
 * @param typeService serviço responsável pela lógica de negócio dos tipos.
 * @param publisher conjunto de publicadores responsáveis por eventos e notificações SSE.
 */
@RestController
@RequestMapping("/api/type")
class TypeController(
    private val typeService: TypeService,
    private val publisher: Publishers,
) {
    /**
     * Cria um tipo de ocorrência no sistema.
     *
     * Caso a operação seja bem-sucedida, é devolvido `201 Created` com o header
     * `Location` a indicar o recurso criado.
     *
     * Em caso de erro de domínio, a resposta é mapeada para o código HTTP apropriado.
     *
     * @param input dados necessários para criação do tipo de ocorrência.
     *
     * @return `201 Created` ou erro de domínio.
     */
    @PostMapping
    fun createType(
        @RequestBody input: TypeCreateInput,
        user: AuthenticatedUser,
    ): ResponseEntity<*> {
        val result = typeService.createType(input.name, input.form)

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header("Location", "/api/type/${result.value.id}")
                    .build<Unit>()

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Obtém um tipo de ocorrência pelo seu identificador único.
     *
     * @param id identificador do tipo.
     *
     * @return `200 OK` com o tipo encontrado ou `404 Not Found` se não existir.
     */
    @GetMapping("/{id}")
    fun findById(
        @PathVariable id: Int,
        user: AuthenticatedUser,
    ): ResponseEntity<*> {
        val result = typeService.findById(id)

        return when (result) {
            is Success -> ResponseEntity.ok(result.value)
            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Obtém um tipo de ocorrência através do seu nome.
     *
     * A pesquisa é realizada com base no nome exato do tipo.
     *
     * @param name nome do tipo.
     *
     * @return `200 OK` com o tipo correspondente ou `404 Not Found` se não existir.
     */
    @GetMapping("/name/{name}")
    fun findByName(
        @PathVariable name: String,
        user: AuthenticatedUser,
    ): ResponseEntity<*> {
        val result = typeService.findByName(name)

        return when (result) {
            is Success -> ResponseEntity.ok(result.value)
            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Lista todos os tipos de ocorrência registados no sistema.
     *
     * @return `200 OK` com a lista completa de tipos.
     */
    @GetMapping
    fun findAll(user: AuthenticatedUser): ResponseEntity<List<Type>> = ResponseEntity.ok(typeService.findAll())

    /**
     * Atualiza os dados de um tipo de ocorrência existente.
     *
     * Permite modificar o nome e a definição do formulário associado ao tipo.
     *
     * @param id identificador do tipo a atualizar.
     * @param input novos dados do tipo.
     *
     * @return `200 OK` com o tipo atualizado ou erro de domínio mapeado.
     */
    @PutMapping("/{id}")
    fun updateType(
        @PathVariable id: Int,
        @RequestBody input: TypeUpdateInput,
        user: AuthenticatedUser,
    ): ResponseEntity<*> {
        val result = typeService.updateType(id, input.name, input.form)

        return when (result) {
            is Success -> ResponseEntity.ok(result.value)
            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Remove um tipo de ocorrência do sistema pelo seu identificador.
     *
     * @param id identificador do tipo.
     *
     * @return tipo removido ou erro de domínio mapeado.
     */
    @DeleteMapping("/{id}")
    fun deleteById(
        @PathVariable id: Int,
        user: AuthenticatedUser,
    ): ResponseEntity<*> {
        val result = typeService.deleteById(id)

        return when (result) {
            is Success -> ResponseEntity.status(HttpStatus.NO_CONTENT).build<Unit>()
            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Fornece um endpoint SSE para subscrição de alterações na lista global de tipos.
     *
     * Permite receber eventos em tempo real sempre que a lista de tipos é atualizada.
     *
     * Endpoint: GET /listen
     *
     * @return [SseEmitter] com ligação persistente para eventos globais.
     */
    @GetMapping("/listen")
    fun listenIntervenors(): SseEmitter {
        val sseEmitter = SseEmitter(Long.MAX_VALUE)
        publisher.typesPublisher.addEmitter(
            SSEUpdatedDataAdapter(
                sseEmitter,
            ),
        )
        return sseEmitter
    }

    /**
     * Converte um erro de domínio [TypeError] na resposta HTTP correspondente.
     *
     * Mapeamento de erros:
     * - [TypeError.TypeNotFound] → 404 Not Found
     * - [TypeError.TypeAlreadyExists] → 400 Bad Request
     * - [TypeError.InvalidName] → 400 Bad Request
     *
     * @receiver Erro de domínio a converter.
     * @return [ResponseEntity] com o [Problem] e o código HTTP adequados.
     */
    private fun TypeError.toResponse(): ResponseEntity<*> =
        when (this) {
            is TypeError.TypeNotFound -> Problem.TypeNotFound.response(HttpStatus.NOT_FOUND)
            is TypeError.TypeAlreadyExists -> Problem.TypeAlreadyExists.response(HttpStatus.BAD_REQUEST)
            is TypeError.InvalidName -> Problem.InvalidName.response(HttpStatus.BAD_REQUEST)
            else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
        }
}
