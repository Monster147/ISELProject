package pt.ira.model.role

/**
 * Modelo de transferência de dados para operações de gestão de cargos (roles) de utilizadores.
 *
 * Encapsula os identificadores necessários para adicionar ou remover um cargo de um utilizador.
 * Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * permitindo operações de atribuição ou revogação de cargos no controlo de acessos.
 *
 * @property roleId Identificador do cargo a ser adicionado ou removido.
 * @property userId Identificador do utilizador cuja lista de cargos será modificada.
 *
 * @see Role
 * @see User
 */
data class RoleInput(
    val roleId: Int,
    val userId: Int,
)
