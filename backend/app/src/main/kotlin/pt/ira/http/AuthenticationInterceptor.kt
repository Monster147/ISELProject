package pt.ira.http

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.method.HandlerMethod
import org.springframework.web.servlet.HandlerInterceptor
import pt.ira.user.AuthenticatedUser

/**
 * Interceptor HTTP responsável por validar a autenticação em pedidos que o requeiram.
 *
 * Antes de cada pedido ser encaminhado para o controller, verifica se o método alvo
 * declara um parâmetro do tipo [AuthenticatedUser]. Caso declare, valida o token
 * presente no cabeçalho `Authorization`. Se o token for válido, armazena o utilizador
 * autenticado nos atributos do pedido para ser resolvido pelo
 * [AuthenticatedUserArgumentResolver]. Caso contrário, responde com HTTP 401.
 *
 * @param authorizationHeaderProcessor Processador responsável por extrair e validar
 *                                     o token a partir do cabeçalho de autorização.
 *
 * @see AuthenticatedUserArgumentResolver
 * @see RequestTokenProcessor
 */
@Component
class AuthenticationInterceptor(
    private val authorizationHeaderProcessor: RequestTokenProcessor,
) : HandlerInterceptor {
    /**
     * Intercepta o pedido antes de ser processado pelo handler.
     *
     * Se o método do handler requerer autenticação (parâmetro [AuthenticatedUser]),
     * processa o cabeçalho `Authorization` e valida o token. Em caso de falha,
     * responde com HTTP 401 e o cabeçalho `WWW-Authenticate`.
     *
     * @param request Pedido HTTP recebido.
     * @param response Resposta HTTP a enviar.
     * @param handler Handler que irá processar o pedido.
     * @return `true` se o pedido deve prosseguir, `false` caso a autenticação falhe.
     */
    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
    ): Boolean {
        if (handler is HandlerMethod &&
            handler.methodParameters.any {
                it.parameterType == AuthenticatedUser::class.java
            }
        ) {
            // enforce authentication
            val user =
                authorizationHeaderProcessor.processAuthorizationHeaderValue(request.getHeader(NAME_AUTHORIZATION_HEADER))
            return if (user == null) {
                response.status = 401
                response.addHeader(NAME_WWW_AUTHENTICATE_HEADER, RequestTokenProcessor.Companion.SCHEME)
                false
            } else {
                AuthenticatedUserArgumentResolver.Companion.addUserTo(user, request)
                true
            }
        }

        return true
    }

    companion object {
        const val NAME_AUTHORIZATION_HEADER = "Authorization"
        private const val NAME_WWW_AUTHENTICATE_HEADER = "WWW-Authenticate"
    }
}
