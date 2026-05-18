package pt.ira.model.report

/**
 * Modelo de transferência de dados para operações de gestão de editores de relatórios.
 *
 * Encapsula o identificador de um utilizador a ser adicionado ou removido como editor
 * de um relatório. Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * permitindo operações de atribuição ou revogação de privilégios de edição em relatórios específicos.
 *
 * @property editorId Identificador único do utilizador a ser adicionado ou removido como editor.
 *
 * @see Report
 * @see User
 */
data class EditorInput(
    val editorId: Int,
)
