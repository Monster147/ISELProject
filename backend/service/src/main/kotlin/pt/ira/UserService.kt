package pt.ira

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import pt.ira.interfaces.TransactionManager
import pt.ira.report.ReportTypePercentage
import pt.ira.token.Token
import pt.ira.token.TokenEncoder
import pt.ira.token.TokenExternalInfo
import pt.ira.user.PasswordValidationInfo
import pt.ira.user.User
import pt.ira.user.UsersDomainConfig
import java.security.SecureRandom
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.util.Base64.getUrlDecoder
import java.util.Base64.getUrlEncoder
import kotlin.math.round

/**
 * Hierarquia de erros específicos do domínio dos utilizadores.
 *
 * Encapsula as situações de erro que podem ocorrer durante operações com utilizadores,
 * permitindo uma tratamento explícito e tipificado dos cenários de falha.
 *
 * @see TypeService
 */
sealed class UserError {
    /**
     * O endereço de email fornecido já está registado no sistema.
     */
    data object AlreadyUsedEmailAddress : UserError()

    /**
     * A palavra-passe fornecida não cumpre os requisitos mínimos de segurança.
     */
    data object InsecurePassword : UserError()

    /**
     * O utilizador solicitado não foi encontrado no sistema,
     * quer por email quer por identificador.
     */
    data object UserNotFound : UserError()

    /**
     * Um dos cargos (roles) especificados não existe no sistema.
     */
    data object RoleDoesntExist : UserError()

    /**
     * O utilizador não possui permissões administrativas.
     */
    data object UserNotAdmin : UserError()
}

sealed class TokenCreationError {
    data object UserOrPasswordAreInvalid : TokenCreationError()
}

/**
 * Serviço responsável pela gestão do ciclo de vida dos utilizadores e autenticação.
 *
 * Responsabilidades principais:
 * - criação e consulta de utilizadores;
 * - validação e gestão de palavras-passe;
 * - gestão de papéis (roles) dos utilizadores;
 * - geração, validação e revogação de tokens de autenticação;
 * - cálculo de métricas associadas a relatórios.
 *
 * @param passwordEncoder codificador de palavras-passe.
 * @param tokenEncoder codificador de tokens.
 * @param config configuração do domínio de utilizadores.
 * @param trxManager gestor de transações usado para aceder aos repositórios dentro de unidades de trabalho.
 * @param clock fonte de tempo usada para validação temporal de tokens.
 */
@Component
class UserService(
    private val passwordEncoder: PasswordEncoder,
    private val tokenEncoder: TokenEncoder,
    private val config: UsersDomainConfig,
    private val trxManager: TransactionManager,
    private val clock: Clock,
) {
    /**
     * Valida uma palavra-passe contra a informação de validação armazenada.
     *
     * @param password Palavra-passe em texto simples.
     * @param validationInfo Informação de validação da palavra-passe.
     *
     * @return `true` se a palavra-passe for válida, `false` caso contrário.
     */
    fun validatePassword(
        password: String,
        validationInfo: PasswordValidationInfo,
    ) = passwordEncoder.matches(
        password,
        validationInfo.validationInfo,
    )

    private fun createPasswordValidationInformation(password: String) =
        PasswordValidationInfo(
            validationInfo = passwordEncoder.encode(password),
        )

    /**
     * Verifica se uma palavra-passe cumpre os requisitos mínimos de segurança.
     *
     * @param password Palavra-passe a validar.
     *
     * @return `true` se a palavra-passe for considerada segura, `false` caso contrário.
     */
    fun isSafePassword(password: String) = password.length > 4

    /**
     * Cria um utilizador.
     *
     * Valida a segurança da palavra-passe, se o email é único
     * e a existência dos papéis associados.
     *
     * @param name Nome do utilizador.
     * @param email Endereço de email.
     * @param password Palavra-passe em texto claro.
     * @param roles Lista de identificadores de papéis.
     *
     * @return [User] criado, ou um erro do tipo [UserError].
     */
    fun createUser(
        name: String,
        email: String,
        password: String,
        roles: List<Int> = listOf(2),
    ): Either<UserError, User> {
        if (!isSafePassword(password)) {
            return failure(UserError.InsecurePassword)
        }

        val passwordValidationInfo = createPasswordValidationInformation(password)

        return trxManager.run {
            if (repoUsers.findByEmail(email) != null) {
                return@run failure(UserError.AlreadyUsedEmailAddress)
            }

            if (roles.any { repoRole.findById(it) == null }) {
                return@run failure(UserError.RoleDoesntExist)
            }
            val participant = repoUsers.createUser(name, email, passwordValidationInfo, roles)
            success(participant)
        }
    }

    /**
     * Obtém um utilizador pelo email.
     *
     * @param email Endereço de email.
     *
     * @return [User] correspondente, ou erro do tipo [UserError].
     */
    fun findUserByEmail(email: String): Either<UserError, User> =
        trxManager.run {
            val user = repoUsers.findByEmail(email)
            if (user == null) {
                failure(UserError.UserNotFound)
            } else {
                success(user)
            }
        }

    /**
     * Obtém todos os utilizadores com um determinado papel.
     *
     * @param roleId Identificador do papel.
     *
     * @return Lista de [User] com o papel indicado, ou erro do tipo [UserError].
     */
    fun findUsersByRoles(roleId: Int): Either<UserError, List<User>> {
        return trxManager.run {
            val users = repoUsers.findUsersByRole(roleId)
            if (users.isEmpty()) failure(UserError.UserNotFound) else success(users)
        }
    }

    /**
     * Obtém um utilizador pelo identificador.
     *
     * @param userId Identificador do utilizador.
     *
     * @return [User] correspondente, ou erro do tipo [UserError].
     */
    fun findUserById(userId: Int): Either<UserError, User> =
        trxManager.run {
            val user = repoUsers.findById(userId)
            if (user == null) {
                failure(UserError.UserNotFound)
            } else {
                success(user)
            }
        }

    /**
     * Adiciona um papel a um utilizador.
     *
     * Valida a existência do utilizador, do administrador e do papel,
     * bem como permissões administrativas.
     *
     * @param adminId Identificador do administrador.
     * @param userId Identificador do utilizador.
     * @param roleId Identificador do papel a adicionar.
     *
     * @return [User] atualizado, ou erro do tipo [UserError].
     */
    fun addRole(
        adminId: Int,
        userId: Int,
        roleId: Int,
    ): Either<UserError, User> {
        return trxManager.run {
            val admin = repoUsers.findById(adminId) ?: return@run failure(UserError.UserNotFound)
            val user = repoUsers.findById(userId) ?: return@run failure(UserError.UserNotFound)
            if (repoRole.findById(roleId) == null) return@run failure(UserError.RoleDoesntExist)
            if (!admin.roles.contains(1)) return@run failure(UserError.UserNotAdmin)
            val updatedUser = repoUsers.addRole(user, roleId)
            success(updatedUser)
        }
    }

    /**
     * Remove um papel de um utilizador.
     *
     * Valida a existência do utilizador, do administrador e do papel,
     * bem como permissões administrativas.
     *
     * @param adminId Identificador do administrador.
     * @param userId Identificador do utilizador.
     * @param roleId Identificador do papel a remover.
     *
     * @return [User] atualizado, ou erro do tipo [UserError].
     */
    fun removeRole(
        adminId: Int,
        userId: Int,
        roleId: Int,
    ): Either<UserError, User> {
        return trxManager.run {
            val admin = repoUsers.findById(adminId) ?: return@run failure(UserError.UserNotFound)
            val user = repoUsers.findById(userId) ?: return@run failure(UserError.UserNotFound)
            if (repoRole.findById(roleId) == null) return@run failure(UserError.RoleDoesntExist)
            if (!admin.roles.contains(1)) return@run failure(UserError.UserNotAdmin)
            val updatedUser = repoUsers.removeRole(user, roleId)
            success(updatedUser)
        }
    }

    /**
     * Define os papéis de um utilizador.
     *
     * Substitui completamente a lista de papéis existente.
     * Valida a existência dos papéis e permissões administrativas.
     *
     * @param adminId Identificador do administrador.
     * @param userId Identificador do utilizador.
     * @param roleIdList Lista de identificadores de papéis.
     *
     * @return [User] atualizado, ou erro do tipo [UserError].
     */
    fun setRole(
        adminId: Int,
        userId: Int,
        roleIdList: List<Int>,
    ): Either<UserError, User> {
        return trxManager.run {
            val admin = repoUsers.findById(adminId) ?: return@run failure(UserError.UserNotFound)
            val user = repoUsers.findById(userId) ?: return@run failure(UserError.UserNotFound)
            if (roleIdList.any { repoRole.findById(it) == null }) {
                return@run failure(UserError.RoleDoesntExist)
            }
            if (!admin.roles.contains(1)) return@run failure(UserError.UserNotAdmin)
            val updatedUser = repoUsers.setRoles(user, roleIdList)
            success(updatedUser)
        }
    }

    /**
     * Calcula a percentagem de tipos de relatórios associados a um utilizador.
     *
     * Agrupa os relatórios por tipo e calcula a percentagem relativa
     * de cada grupo.
     *
     * @param reporterId Identificador do utilizador.
     *
     * @return Lista de [ReportTypePercentage] com as estatísticas calculadas.
     */
    fun getTypePercentagesByReporter(reporterId: Int): List<ReportTypePercentage> {
        return trxManager.run {
            val reports = repoReport.findByEditor(reporterId)
            if (reports.isEmpty()) return@run emptyList()
            val totalReports = reports.size.toDouble()
            reports
                .groupBy { it.type }
                .map { (type, groupedReports) ->
                    val rawPercentage = (groupedReports.size / totalReports) * 100
                    val rounded = round(rawPercentage * 10) / 10
                    ReportTypePercentage(
                        type = type,
                        count = groupedReports.size,
                        percentage = rounded,
                    )
                }
        }
    }

    /**
     * Cria um token de autenticação para um utilizador.
     *
     * Valida as credenciais e gera um novo token com informação temporal associada.
     *
     * @param email Endereço de email.
     * @param password Palavra-passe.
     *
     * @return Informação externa do token, ou erro do tipo [TokenCreationError].
     */
    fun createToken(
        email: String,
        password: String,
    ): Either<TokenCreationError, TokenExternalInfo> {
        if (email.isBlank() || password.isBlank()) {
            return failure(TokenCreationError.UserOrPasswordAreInvalid)
        }
        return trxManager.run {
            val user: User =
                repoUsers.findByEmail(email)
                    ?: return@run failure(TokenCreationError.UserOrPasswordAreInvalid)
            if (!validatePassword(password, user.passwordValidation)) {
                return@run failure(TokenCreationError.UserOrPasswordAreInvalid)
            }
            val tokenValue = generateTokenValue()
            val now = clock.instant()
            val newToken =
                Token(
                    tokenEncoder.createValidationInformation(tokenValue),
                    user.id,
                    createdAt = now,
                    lastUsedAt = now,
                )
            repoUsers.createToken(newToken, config.maxTokensPerUser)
            Either.Right(
                TokenExternalInfo(
                    tokenValue,
                    getTokenExpiration(newToken),
                ),
            )
        }
    }

    /**
     * Revoga um token de autenticação.
     *
     * @param token Valor do token.
     *
     * @return `true` após a revogação.
     */
    fun revokeToken(token: String): Boolean {
        val tokenValidationInfo = tokenEncoder.createValidationInformation(token)
        return trxManager.run {
            repoUsers.removeTokenByValidationInfo(tokenValidationInfo)
            true
        }
    }

    /**
     * Obtém um utilizador com base num token válido.
     *
     * Valida o formato e validade temporal do token.
     *
     * @param token Valor do token.
     *
     * @return [User] correspondente, ou `null` se o token for inválido.
     */
    fun getUserByToken(token: String): User? {
        if (!canBeToken(token)) {
            return null
        }
        return trxManager.run {
            val tokenValidationInfo = tokenEncoder.createValidationInformation(token)
            val userAndToken: Pair<User, Token>? = repoUsers.getTokenByTokenValidationInfo(tokenValidationInfo)
            if (userAndToken != null && isTokenTimeValid(clock, userAndToken.second)) {
                repoUsers.updateTokenLastUsed(userAndToken.second, clock.instant())
                userAndToken.first
            } else {
                null
            }
        }
    }

    private fun canBeToken(token: String): Boolean =
        try {
            getUrlDecoder().decode(token).size == config.tokenSizeInBytes
        } catch (ex: IllegalArgumentException) {
            false
        }

    private fun isTokenTimeValid(
        clock: Clock,
        token: Token,
    ): Boolean {
        val now = clock.instant()
        return token.createdAt <= now &&
            Duration.between(now, token.createdAt) <= config.tokenTtl &&
            Duration.between(now, token.lastUsedAt) <= config.tokenRollingTtl
    }

    private fun generateTokenValue(): String =
        ByteArray(config.tokenSizeInBytes).let { byteArray ->
            SecureRandom.getInstanceStrong().nextBytes(byteArray)
            getUrlEncoder().encodeToString(byteArray)
        }

    private fun getTokenExpiration(token: Token): Instant {
        val absoluteExpiration = token.createdAt + config.tokenTtl
        val rollingExpiration = token.lastUsedAt + config.tokenRollingTtl
        return if (absoluteExpiration < rollingExpiration) {
            absoluteExpiration
        } else {
            rollingExpiration
        }
    }
}
