package pt.ira.model.occurrence

/**
 * Modelo de transferência de dados para operações de associação de intervenientes.
 *
 * Encapsula o identificador de um interveniente a ser adicionado ou removido de uma ocorrência.
 * Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * permitindo operações de vinculação ou desvinculação de intervenientes a ocorrências específicas.
 *
 * @property intervenorId Identificador único do interveniente a ser associado ou desassociado.
 *
 * @see Intervenor
 * @see Occurrence
 */
data class IntervenorIdInput(
    val intervenorId: Int,
)
