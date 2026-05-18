package pt.ira.model.user

/**
 * Modelo de transferência de dados para a resposta de informações de utilizador autenticado.
 *
 * Encapsula os dados públicos de um utilizador autenticado a ser devolvidos ao cliente.
 * Este modelo é utilizado como contrato entre o controlador e o cliente HTTP,
 * permitindo que o servidor forneça uma vista segura e filtrada das informações do utilizador
 * sem expor dados sensíveis como palavras-passe ou tokens.
 *
 * @property id Identificador único do utilizador.
 * @property name Nome completo do utilizador.
 * @property email Endereço de email do utilizador (identificador único).
 * @property roles Lista de identificadores dos cargos (roles) atribuídos ao utilizador,
 *                 determinando as suas permissões e privilégios no sistema.
 *
 * @see User
 * @see AuthenticatedUser
 */
data class UserHomeOutputModel(
    val id: Int,
    val name: String,
    val email: String,
    val roles: List<Int>,
)
