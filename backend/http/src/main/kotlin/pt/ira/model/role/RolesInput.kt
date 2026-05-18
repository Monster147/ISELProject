package pt.ira.model.role

/**
 * Modelo de transferência de dados para a atribuição completa de cargos a um utilizador.
 *
 * Encapsula a lista de cargos a ser atribuída a um utilizador, substituindo completamente
 * a lista de cargos existente. Este modelo é utilizado como contrato entre o cliente HTTP
 * e o controlador, permitindo operações de reconfiguração total de permissões de um utilizador.
 *
 * @property rolesIds Lista de identificadores dos cargos a atribuir ao utilizador.
 *                    A lista completa substitui todos os cargos anteriormente atribuídos.
 * @property userId Identificador do utilizador cuja lista de cargos será substituída.
 *
 * @see Role
 * @see User
 * @see RoleInput
 */
data class RolesInput(
    val rolesIds: List<Int>,
    val userId: Int,
)
