package pt.ira

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import pt.ira.model.Problem
import pt.ira.model.role.RoleInput
import pt.ira.model.role.RolesInput
import pt.ira.model.user.UserCreateTokenInputModel
import pt.ira.model.user.UserCreateTokenOutputModel
import pt.ira.model.user.UserHomeOutputModel
import pt.ira.model.user.UserInput
import pt.ira.report.ReportTypePercentage
import pt.ira.user.AuthenticatedUser
import pt.ira.user.User

/**
 * Controlador REST responsável pela gestão de utilizadores no sistema.
 *
 * Expõe endpoints HTTP para criação de utilizadores, autenticação, gestão de sessões,
 * consulta de informação de utilizador e administração de papéis (roles), bem como
 * operações analíticas associadas ao utilizador.
 *
 * Atua como camada de adaptação entre o protocolo HTTP e a lógica de domínio,
 * delegando toda a execução ao [UserService] e convertendo resultados em respostas HTTP
 * com mapeamento explícito de erros de domínio.
 *
 * Responsabilidades principais:
 * - criação de utilizadores;
 * - autenticação e geração/revogação de *tokens*;
 * - obtenção de dados do utilizador autenticado;
 * - consulta de utilizadores por identificador e por papel;
 * - gestão de papéis atribuídos a utilizadores (adicionar, remover, definir);
 * - obtenção de métricas associadas ao utilizador;
 * - tradução de erros de domínio para respostas HTTP consistentes.
 *
 * @param userService serviço responsável pela lógica de negócio associada aos utilizadores.
 */
@RestController
@RequestMapping("/api/user")
class UserController(
    private val userService: UserService,
) {
    /**
     * Cria um utilizador no sistema.
     *
     * Em caso de sucesso, devolve `201 Created` com o header `Location`
     * a apontar para o recurso criado.
     *
     * @param userInput dados necessários para criação do utilizador.
     *
     * @return resposta HTTP com o resultado da operação.
     */
    @PostMapping
    fun createUser(
        @RequestBody userInput: UserInput,
    ): ResponseEntity<*> {
        val result: Either<UserError, User> =
            userService.createUser(
                name = userInput.name,
                email = userInput.email,
                password = userInput.password,
            )

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header(
                        "Location",
                        "/api/user/${result.value.id}",
                    ).build<Unit>()

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Gera um *token* de autenticação para um utilizador.
     *
     * Utilizado para autenticação no sistema com base em email e *password*.
     *
     * @param tokenInput credenciais do utilizador.
     *
     * @return `201 Created` com o *token* gerado ou erro de autenticação.
     */
    @PostMapping("/token")
    fun token(
        @RequestBody tokenInput: UserCreateTokenInputModel,
    ): ResponseEntity<*> {
        val result =
            userService.createToken(
                tokenInput.email,
                tokenInput.password,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(UserCreateTokenOutputModel(result.value.tokenValue))

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Termina a sessão do utilizador autenticado.
     *
     * Revoga o *token* ativo associado ao utilizador.
     *
     * @param user utilizador autenticado.
     */
    @PostMapping("/logout")
    fun logout(user: AuthenticatedUser) {
        userService.revokeToken(user.token)
    }

    /**
     * Obtém os dados do utilizador autenticado.
     *
     * @param user utilizador autenticado.
     *
     * @return dados do utilizador em formato de resposta de domínio.
     */
    @GetMapping("/me")
    fun userHome(userAuthenticatedUser: AuthenticatedUser): ResponseEntity<UserHomeOutputModel> =
        ResponseEntity
            .status(HttpStatus.OK)
            .body(
                UserHomeOutputModel(
                    userAuthenticatedUser.user.id,
                    userAuthenticatedUser.user.name,
                    userAuthenticatedUser.user.email,
                    userAuthenticatedUser.user.roles,
                ),
            )

    /**
     * Obtém um utilizador pelo seu identificador.
     *
     * @param userId identificador do utilizador.
     *
     * @return `200 OK` com o utilizador ou `404 Not Found` se não existir.
     */
    @GetMapping("/{userId}")
    fun findUserById(
        @PathVariable("userId") userId: Int,
    ): ResponseEntity<*> {
        val result = userService.findUserById(userId)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(
                        UserHomeOutputModel(
                            result.value.id,
                            result.value.name,
                            result.value.email,
                            result.value.roles,
                        ),
                    )

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Atribui um papel a um utilizador.
     *
     * Requer permissões administrativas.
     *
     * @param roleInput dados contendo o utilizador e o papel a atribuir.
     *
     * @return confirmação da operação ou erro de permissão/validação.
     */
    @PostMapping("/roles/add")
    fun addRole(
        user: AuthenticatedUser,
        @RequestBody roleInput: RoleInput,
    ): ResponseEntity<*> {
        val result =
            userService.addRole(
                adminId = user.user.id,
                userId = roleInput.userId,
                roleId = roleInput.roleId,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body("Role added successfully")

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Remove um papel de um utilizador.
     *
     * Requer permissões administrativas.
     *
     * @param roleInput dados contendo o utilizador e o papel a remover.
     *
     * @return confirmação da operação ou erro de permissão/validação.
     */
    @PostMapping("/roles/remove")
    fun removeRole(
        user: AuthenticatedUser,
        @RequestBody roleInput: RoleInput,
    ): ResponseEntity<*> {
        val result =
            userService.removeRole(
                adminId = user.user.id,
                userId = roleInput.userId,
                roleId = roleInput.roleId,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body("Role removed successfully")

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Substitui todos os papéis de um utilizador.
     *
     * Requer permissões administrativas.
     *
     * @param rolesInput lista completa de papéis a atribuir.
     *
     * @return confirmação da operação ou erro de permissão/validação.
     */
    @PostMapping("/roles/set")
    fun setRoles(
        user: AuthenticatedUser,
        @RequestBody rolesInput: RolesInput,
    ): ResponseEntity<*> {
        val result =
            userService.setRole(
                adminId = user.user.id,
                userId = rolesInput.userId,
                roleIdList = rolesInput.rolesIds,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body("Roles setted successfully")

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Obtém todos os utilizadores associados a um determinado papel.
     *
     * @param roleId identificador do papel.
     *
     * @return lista de utilizadores associados ao papel.
     */
    @GetMapping("/find/role/{roleId}")
    fun findUsersByRole(
        @PathVariable roleId: Int,
    ): ResponseEntity<*> {
        val result = userService.findUsersByRoles(roleId)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(
                        result.value.map { user ->
                            UserHomeOutputModel(
                                user.id,
                                user.name,
                                user.email,
                                user.roles,
                            )
                        },
                    )

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Obtém a distribuição percentual de tipos de relatórios associados a um utilizador.
     *
     * @param userId identificador do utilizador.
     *
     * @return lista de percentagens por tipo de relatório.
     */
    @GetMapping("/percentages/{userId}")
    fun getPercentages(
        @PathVariable userId: Int,
    ): ResponseEntity<List<ReportTypePercentage>> = ResponseEntity.ok(userService.getTypePercentagesByReporter(userId))

    /**
     * Converte um erro de domínio [UserError] na resposta HTTP correspondente.
     *
     * Mapeamento de erros:
     * - [UserError.RoleDoesntExist] → 404 Not Found
     * - [UserError.UserNotFound] → 404 Not Found
     * - [UserError.UserNotAdmin] → 403 Forbidden
     * - [UserError.InsecurePassword] → 400 Bad Request
     * - [UserError.AlreadyUsedEmailAddress] → 400 Bad Request
     *
     * @receiver Erro de domínio a converter.
     * @return [ResponseEntity] com o [Problem] e o código HTTP adequados.
     */
    private fun UserError.toResponse(): ResponseEntity<*> =
        when (this) {
            is UserError.RoleDoesntExist -> Problem.RoleNotFound.response(HttpStatus.NOT_FOUND)
            is UserError.UserNotFound -> Problem.UserNotFound.response(HttpStatus.NOT_FOUND)
            is UserError.UserNotAdmin -> Problem.UserNotAdmin.response(HttpStatus.FORBIDDEN)
            is UserError.InsecurePassword -> Problem.InsecurePassword.response(HttpStatus.BAD_REQUEST)
            is UserError.AlreadyUsedEmailAddress -> Problem.EmailAlreadyInUse.response(HttpStatus.BAD_REQUEST)
            else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
        }

    /**
     * Converte um erro de domínio [TokenCreationError] na resposta HTTP correspondente.
     *
     * Mapeamento de erros:
     * - [TokenCreationError.UserOrPasswordAreInvalid] → 400 Bad Request
     *
     * @receiver Erro de domínio a converter.
     * @return [ResponseEntity] com o [Problem] e o código HTTP adequados.
     */
    private fun TokenCreationError.toResponse(): ResponseEntity<*> =
        when (this) {
            is TokenCreationError.UserOrPasswordAreInvalid -> Problem.UserOrPasswordAreInvalid.response(HttpStatus.BAD_REQUEST)
            else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
        }
}
