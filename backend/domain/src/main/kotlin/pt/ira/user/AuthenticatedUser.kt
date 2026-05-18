package pt.ira.user

/**
 * Representa um utilizador autenticado com a sua sessão ativa.
 *
 * Este modelo encapsula a informação de um utilizador que foi autenticado com sucesso,
 * juntamente com o token de sessão gerado. É utilizado como resposta do servidor após
 * um login bem-sucedido, permitindo que o cliente obtenha tanto os dados do utilizador
 * como o seu token para utilização em pedidos subsequentes.
 *
 * @property user Instância de [User] contendo os dados e permissões do utilizador autenticado.
 * @property token Token de sessão a ser utilizado pelo cliente para autenticar
 *                 pedidos futuros na api.
 *
 * @constructor Cria uma instância de [AuthenticatedUser] com a informação de utilizador
 *              e token de sessão obtidas após autenticação bem-sucedida.
 *
 * @see User
 * @see TokenExternalInfo
 */

class AuthenticatedUser(
    val user: User,
    val token: String,
)
