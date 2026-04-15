package pt.ira

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import pt.ira.model.Problem

/**
 * Controlador REST responsável pela gestão de papéis (roles) no sistema.
 *
 * Expõe endpoints HTTP para criação, eliminação e consulta de papéis, permitindo
 * a gestão centralizada de permissões ou categorias associadas a utilizadores, ou entidades.
 *
 * Atua como camada de adaptação entre o protocolo HTTP e a lógica de domínio,
 * delegando todas as operações ao [RoleService] e convertendo os resultados em
 * respostas HTTP consistentes com mapeamento explícito de erros.
 *
 * Responsabilidades principais:
 * - criação de novos papéis;
 * - eliminação de papéis por nome;
 * - consulta de papéis por nome e identificador;
 * - listagem completa de todos os papéis;
 * - tradução de erros de domínio para respostas HTTP apropriadas.
 *
 * @param roleService serviço responsável pela lógica de negócio associada aos papéis.
 */
@RestController
@RequestMapping("/api/role")
class RoleController(
    private val roleService: RoleService,
) {
    /**
     * Cria um papel no sistema.
     *
     * Em caso de sucesso, devolve `201 Created` com o header `Location`
     * a indicar o recurso criado.
     *
     * @param roleName nome do papel a criar.
     *
     * @return resposta HTTP com o resultado da operação.
     */
    @PostMapping
    fun createRole(
        @RequestBody roleName: String,
    ): ResponseEntity<*> {
        val result = roleService.createRole(roleName)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(201)
                    .header(
                        "Location",
                        "/api/role/${result.value.id}",
                    ).build<Unit>()
            is Failure ->
                when (result.value) {
                    is RoleError.RoleAlreadyExists ->
                        Problem.RoleAlreadyExists.response(HttpStatus.BAD_REQUEST)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Elimina um papel pelo seu nome.
     *
     * Em caso de sucesso, devolve `204 No Content`.
     *
     * @param roleName nome do papel a eliminar.
     *
     * @return resposta HTTP correspondente ao resultado da operação.
     */
    @DeleteMapping("/{roleName}")
    fun delete(
        @PathVariable roleName: String,
    ): ResponseEntity<*> {
        val result = roleService.deleteRoleByName(roleName)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.NO_CONTENT)
                    .build<Unit>()
            is Failure ->
                when (result.value) {
                    is RoleError.RoleNotFound ->
                        Problem.RoleNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém um papel pelo seu nome.
     *
     * @param roleName nome do papel.
     *
     * @return `200 OK` com o papel ou `404 Not Found` se não existir.
     */
    @GetMapping("/byName/{roleName}")
    fun findByName(
        @PathVariable roleName: String,
    ): ResponseEntity<*> {
        val result = roleService.findByName(roleName)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure ->
                when (result.value) {
                    is RoleError.RoleNotFound ->
                        Problem.RoleNotFound.response(HttpStatus.NOT_FOUND)

                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém um papel pelo seu identificador.
     *
     * @param id identificador do papel.
     *
     * @return `200 OK` com o papel ou `404 Not Found` se não existir.
     */
    @GetMapping("/byId/{id}")
    fun findById(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = roleService.findById(id)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure ->
                when (result.value) {
                    is RoleError.RoleNotFound ->
                        Problem.RoleNotFound.response(HttpStatus.NOT_FOUND)

                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém todos os papéis registados no sistema.
     *
     * @return `200 OK` com a lista completa de papéis.
     */
    @GetMapping
    fun findAll(): ResponseEntity<*> {
        val result = roleService.findAllRoles()
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result)
    }
}
