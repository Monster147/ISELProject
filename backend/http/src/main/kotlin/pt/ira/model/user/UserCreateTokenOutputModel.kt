package pt.ira.model.user

/**
 * Modelo de transferência de dados para a resposta de criação de *tokens*.
 *
 * Encapsula o *token* de autenticação gerado após uma autenticação bem-sucedida.
 * Este modelo é utilizado como contrato entre o controlador e o cliente HTTP,
 * permitindo que o servidor devolva o *token* de sessão a ser utilizado em pedidos subsequentes.
 *
 * @property token Valor do *token* de autenticação gerado, a ser utilizado pelo cliente
 *                 para autenticar pedidos futuros à API.
 *
 * @see TokenExternalInfo
 * @see UserCreateTokenInputModel
 */
data class UserCreateTokenOutputModel(
    val token: String,
)
