package pt.ira.intervenor

import pt.ira.occurrence.Occurrence

/**
 * Resultado da remoção de um interveniente de uma ocorrência.
 *
 * Agrega a ocorrência atualizada (sem o interveniente) e a lista atualizada de todas
 * as ocorrências associadas ao utilizador, permitindo notificar o utilizador após a operação.
 *
 * @property occurrence Ocorrência atualizada após a remoção do interveniente.
 * @property occurrences Lista atualizada de todas as ocorrências do utilizador.
 *
 * @see Intervenor
 * @see Occurrence
 */
data class IntervenorRemoveResult(
    val occurrence: Occurrence,
    val occurrences: List<Occurrence>,
)
