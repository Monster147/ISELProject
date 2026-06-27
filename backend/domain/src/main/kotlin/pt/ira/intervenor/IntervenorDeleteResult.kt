package pt.ira.intervenor

/**
 * Resultado da eliminação de um interveniente.
 *
 * Agrega o identificador do interveniente eliminado e a lista atualizada de todos os
 * intervenientes no sistema, permitindo notificar o utilizador após a remoção.
 *
 * @property intervenorId Identificador do interveniente eliminado.
 * @property intervenors Lista atualizada de todos os intervenientes após a eliminação.
 *
 * @see Intervenor
 */
data class IntervenorDeleteResult(
    val intervenorId: Int,
    val intervenors: List<Intervenor>,
)
