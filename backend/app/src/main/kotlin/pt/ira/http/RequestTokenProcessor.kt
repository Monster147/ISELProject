package pt.ira.http

import org.springframework.stereotype.Component
import pt.ira.UserService
import pt.ira.user.AuthenticatedUser

/**
 * Processador responsável por extrair e validar o token de autenticação
 * a partir do cabeçalho `Authorization` de um pedido HTTP.
 *
 * Interpreta o esquema Bearer, extrai o token e delega a validação ao [UserService].
 * Em caso de sucesso, constrói e devolve uma instância de [AuthenticatedUser].
 *
 * @param usersService Serviço de utilizadores usado para validar o token.
 *
 * @see AuthenticationInterceptor
 * @see AuthenticatedUser
 */
@Component
class RequestTokenProcessor(
    val usersService: UserService,
) {
    /**
     * Processa o valor do cabeçalho `Authorization` e retorna o utilizador autenticado.
     *
     * Valida que o valor está no formato `Bearer <token>` e que o token corresponde
     * a um utilizador válido no sistema.
     *
     * @param authorizationValue Valor do cabeçalho `Authorization`, ou null se ausente.
     * @return [AuthenticatedUser] correspondente ao token, ou null se inválido ou ausente.
     */
    fun processAuthorizationHeaderValue(authorizationValue: String?): AuthenticatedUser? {
        if (authorizationValue == null) {
            return null
        }
        val parts = authorizationValue.trim().split(" ")
        if (parts.size != 2) {
            return null
        }
        if (parts[0].lowercase() != SCHEME) {
            return null
        }
        return usersService.getUserByToken(parts[1])?.let {
            AuthenticatedUser(
                it,
                parts[1],
            )
        }
    }

    companion object {
        /** Esquema de autenticação suportado (`bearer`). */
        const val SCHEME = "bearer"
    }
}
