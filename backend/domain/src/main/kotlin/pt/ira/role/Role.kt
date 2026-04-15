package pt.ira.role

/**
 * Representa um papel (role) atribuído a um utilizador no sistema
 *
 * Um role define permissões ou responsabilidades associadas a um utilizador.
 *
 * @property id Identificador único do role.
 * @property displayName Nome legível do role, utilizado para apresentação
 *                      (ex: "Administrador", "Supervisor", "Averiguador").
 *
 * @constructor Cria uma instância de [Role] com os dados fornecidos.
 */
data class Role(
    val id: Int,
    val displayName: String,
)
