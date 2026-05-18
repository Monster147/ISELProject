package pt.ira.role

/**
 * Representa um cargo (role) atribuído a um utilizador no sistema
 *
 * Uma role define permissões ou responsabilidades associadas a um utilizador.
 *
 * @property id Identificador único da role.
 * @property displayName Nome legível da role, utilizado para apresentação
 *                      (ex: "Administrador", "Supervisor", "Averiguador").
 *
 * @constructor Cria uma instância de [Role] com os dados fornecidos.
 */
data class Role(
    val id: Int,
    val displayName: String,
)
