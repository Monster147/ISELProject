package pt.ira.model.user

/**
 * Modelo de transferência de dados para a criação de utilizadores.
 *
 * Encapsula os metadados necessários para a criação de uma nova conta de utilizador no sistema.
 * Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * permitindo que o cliente especifique os elementos essenciais para registar um novo utilizador.
 *
 * @property name Nome do utilizador.
 * @property email Endereço de email do utilizador (deve ser único no sistema).
 * @property password Palavra-passe em texto claro (será processada e encriptada no servidor
 *                    antes de ser armazenada).
 *
 * @see User
 */
data class UserInput(
    val name: String,
    val email: String,
    val password: String,
)
