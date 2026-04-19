package pt.ira


import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pt.ira.model.Problem
import pt.ira.model.type.TypeCreateInput
import pt.ira.model.type.TypeUpdateInput
import pt.ira.type.Type

/**
 * Controlador REST responsável pela gestão de tipos.
 *
 * Expõe endpoints HTTP para criação, consulta, atualização e remoção de tipos.
 * Atua como camada de adaptação entre HTTP e o [TypeService].
 *
 * Responsabilidades:
 * - criação de tipos;
 * - consulta por id e nome;
 * - listagem de tipos;
 * - atualização e remoção;
 * - mapeamento de erros de domínio para respostas HTTP.
 *
 * @param typeService serviço responsável pela lógica de negócio dos tipos.
 */
@RestController
@RequestMapping("/api/type")
class TypeController(
    private val typeService: TypeService,
) {

    /**
     * Cria um tipo.
     *
     * @param input dados do tipo.
     *
     * @return `201 Created` ou erro de domínio.
     */
    @PostMapping
    fun createType(
        @RequestBody input: TypeCreateInput,
    ): ResponseEntity<*> {
        val result = typeService.createType(input.name, input.form)

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header("Location", "/api/type/${result.value.id}")
                    .build<Unit>()

            is Failure ->
                when (result.value) {
                    TypeError.InvalidName -> Problem.InvalidName.response(HttpStatus.BAD_REQUEST)
                    TypeError.TypeAlreadyExists -> Problem.TypeAlreadyExists.response(HttpStatus.BAD_REQUEST)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém um tipo pelo id.
     */
    @GetMapping("/{id}")
    fun findById(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = typeService.findById(id)

        return when (result) {
            is Success -> ResponseEntity.ok(result.value)
            is Failure ->
                when (result.value) {
                    TypeError.TypeNotFound -> Problem.TypeNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém um tipo pelo nome.
     */
    @GetMapping("/name/{name}")
    fun findByName(
        @PathVariable name: String,
    ): ResponseEntity<*> {
        val result = typeService.findByName(name)

        return when (result) {
            is Success -> ResponseEntity.ok(result.value)
            is Failure ->
                when (result.value) {
                    TypeError.TypeNotFound -> Problem.TypeNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Lista todos os tipos.
     */
    @GetMapping
    fun findAll(): ResponseEntity<List<Type>> =
        ResponseEntity.ok(typeService.findAll())

    /**
     * Atualiza um tipo.
     *
     * @param id identificador do tipo
     * @param input dados a atualizar
     */
    @PutMapping("/{id}")
    fun updateType(
        @PathVariable id: Int,
        @RequestBody input: TypeUpdateInput,
    ): ResponseEntity<*> {
        val result = typeService.updateType(id, input.name, input.form)

        return when (result) {
            is Success -> ResponseEntity.ok(result.value)
            is Failure ->
                when (result.value) {
                    TypeError.TypeNotFound -> Problem.TypeNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Remove um tipo.
     */
    @DeleteMapping("/{id}")
    fun deleteById(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = typeService.deleteById(id)

        return when (result) {
            is Success -> ResponseEntity.status(HttpStatus.NO_CONTENT).build<Unit>()
            is Failure ->
                when (result.value) {
                    TypeError.TypeNotFound -> Problem.TypeNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }
}