package pt.ira.model.user

/**
 * Modelo de transferência de dados para autenticação e criação de *tokens*.
 *
 * Encapsula as credenciais de um utilizador necessárias para o processo de autenticação.
 * Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * permitindo que o cliente submeta as suas credenciais para obtenção de um *token* de sessão.
 *
 * @property email Endereço de email do utilizador (identificador único).
 * @property password Palavra-passe do utilizador em texto claro (será processada e encriptada no servidor).
 *
 * @see User
 * @see TokenExternalInfo
 */
data class UserCreateTokenInputModel(
    val email: String,
    val password: String,
)
