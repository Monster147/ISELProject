package pt.ira.interfaces

import pt.ira.token.Token
import pt.ira.token.TokenValidationInfo
import pt.ira.user.PasswordValidationInfo
import pt.ira.user.User
import java.time.Instant

/**
 * Repositório de operações sobre utilizadores.
 */
interface RepositoryUser : Repository<User> {

    /**
     * Cria um novo utilizador no sistema.
     *
     * @param name Nome do utilizador.
     * @param email Email do utilizador (deve ser único).
     * @param passwordValidation Informação de validação da palavra-passe (encriptação da palavra-passe).
     * @param roles Lista de identificadores de roles atribuídos ao utilizador.
     *              Por omissão, é atribuído o role com id 2.
     *
     * @return [User] criado.
     */
    fun createUser(
        name: String,
        email: String,
        passwordValidation: PasswordValidationInfo,
        roles: List<Int> = listOf(2),
    ): User

    /**
     * Procura um utilizador pelo seu email.
     *
     * @param email Email a procurar.
     *
     * @return [User] correspondente, ou null caso não exista.
     */
    fun findByEmail(email: String): User?

    /**
     * Obtém o utilizador associado a um token válido.
     *
     * @param tokenValidationInfo Informação de validação do token.
     *
     * @return Par composto por [User] e [Token], ou null caso não exista.
     */
    fun getTokenByTokenValidationInfo(tokenValidationInfo: TokenValidationInfo): Pair<User, Token>?

    /**
     * Cria e persiste um novo token de autenticação.
     *
     * @param token Token a criar.
     * @param maxTokens Número máximo de tokens permitidos por utilizador.
     */
    fun createToken(
        token: Token,
        maxTokens: Int,
    )

    /**
     * Atualiza o timestamp da última utilização de um token.
     *
     * @param token Token a atualizar.
     * @param now Instante atual a registar como última utilização.
     */
    fun updateTokenLastUsed(
        token: Token,
        now: Instant,
    )

    /**
     * Remove um token com base na sua informação de validação.
     *
     * @param tokenValidationInfo Informação de validação do token.
     *
     * @return Número de tokens removidos.
     */
    fun removeTokenByValidationInfo(tokenValidationInfo: TokenValidationInfo): Int

    /**
     * Obtém todos os utilizadores com um determinado role.
     *
     * @param role Identificador do role.
     *
     * @return Lista de [User] com o role indicado.
     */
    fun findUsersByRole(role: Int): List<User>

    /**
     * Adiciona um role a um utilizador.
     *
     * @param user Utilizador a atualizar.
     * @param roleId Identificador do role a adicionar.
     *
     * @return [User] atualizado com o novo role.
     */
    fun addRole(
        user: User,
        roleId: Int,
    ): User

    /**
     * Remove um role de um utilizador.
     *
     * @param user Utilizador a atualizar.
     * @param roleId Identificador do role a remover.
     *
     * @return [User] atualizado sem o role indicado.
     */
    fun removeRole(
        user: User,
        roleId: Int,
    ): User

    /**
     * Define completamente os roles de um utilizador.
     *
     * Substitui todos os roles existentes pelos fornecidos.
     *
     * @param user Utilizador a atualizar.
     * @param roleIds Lista de identificadores de roles.
     *
     * @return [User] atualizado com os novos roles.
     */
    fun setRoles(
        user: User,
        roleIds: List<Int>,
    ): User
}
