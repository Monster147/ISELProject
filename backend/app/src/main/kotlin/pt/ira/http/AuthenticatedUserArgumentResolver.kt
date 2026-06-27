package pt.ira.http

import jakarta.servlet.http.HttpServletRequest
import org.springframework.core.MethodParameter
import org.springframework.stereotype.Component
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer
import pt.ira.user.AuthenticatedUser

/**
 * Resolver de argumentos responsável por injetar o utilizador autenticado
 * nos parâmetros dos métodos dos controllers.
 *
 * Quando um método de um controller declara um parâmetro do tipo [AuthenticatedUser],
 * este resolver é invocado pelo Spring MVC para fornecer a instância correspondente,
 * obtida a partir dos atributos do pedido HTTP (previamente populados pelo
 * [AuthenticationInterceptor]).
 *
 * @see AuthenticationInterceptor
 * @see AuthenticatedUser
 */

@Component
class AuthenticatedUserArgumentResolver : HandlerMethodArgumentResolver {
    /**
     * Indica se este resolver suporta o parâmetro fornecido.
     *
     * @param parameter Parâmetro do método do controller a avaliar.
     * @return `true` se o tipo do parâmetro for [AuthenticatedUser], `false` caso contrário.
     */
    override fun supportsParameter(parameter: MethodParameter) = parameter.parameterType == AuthenticatedUser::class.java

    /**
     * Resolve o argumento do tipo [AuthenticatedUser] a partir dos atributos do pedido HTTP.
     *
     * @param parameter Parâmetro do método a resolver.
     * @param mavContainer Contentor de modelo e vista (pode ser nulo).
     * @param webRequest Pedido web nativo encapsulado.
     * @param binderFactory Fábrica de binders de dados (pode ser nula).
     * @return Instância de [AuthenticatedUser] associada ao pedido atual.
     * @throws IllegalStateException Se o pedido nativo ou o utilizador não estiverem disponíveis.
     */
    override fun resolveArgument(
        parameter: MethodParameter,
        mavContainer: ModelAndViewContainer?,
        webRequest: NativeWebRequest,
        binderFactory: WebDataBinderFactory?,
    ): Any? {
        val request =
            webRequest.getNativeRequest(HttpServletRequest::class.java)
                ?: throw IllegalStateException("TODO")
        return getUserFrom(request) ?: throw IllegalStateException("TODO")
    }

    companion object {
        private const val KEY = "AuthenticatedUserArgumentResolver"

        /**
         * Armazena o utilizador autenticado como atributo do pedido HTTP.
         *
         * @param user Utilizador autenticado a armazenar.
         * @param request Pedido HTTP onde o atributo será definido.
         */
        fun addUserTo(
            user: AuthenticatedUser,
            request: HttpServletRequest,
        ) = request.setAttribute(KEY, user)

        /**
         * Obtém o utilizador autenticado a partir dos atributos do pedido HTTP.
         *
         * @param request Pedido HTTP de onde o utilizador será lido.
         * @return Instância de [AuthenticatedUser], ou null se não estiver presente.
         */
        fun getUserFrom(request: HttpServletRequest): AuthenticatedUser? =
            request.getAttribute(KEY)?.let {
                it as? AuthenticatedUser
            }
    }
}
