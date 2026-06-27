package pt.ira.intervenor

/**
 * Resultado da atualização de um interveniente.
 *
 * Agrega o interveniente com os dados atualizados e a lista de todos os intervenientes
 * no sistema, permitindo notificar o utilizador com ambos os dados numa única operação.
 *
 * @property updatedIntervenor Interveniente com os dados atualizados.
 * @property intervenors Lista atualizada de todos os intervenientes existentes.
 *
 * @see Intervenor
 */
data class IntervenorUpdateResult(
    val updatedIntervenor: Intervenor,
    val intervenors: List<Intervenor>,
)
