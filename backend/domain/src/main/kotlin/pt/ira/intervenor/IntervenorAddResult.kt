package pt.ira.intervenor

import pt.ira.occurrence.Occurrence

/**
 * Resultado da adição de um interveniente a uma ocorrência.
 *
 * Agrega a ocorrência atualizada com o novo interveniente e a lista atualizada
 * de todas as ocorrências do utilizador, permitindo notificar o utilizador com ambos
 * os dados numa única operação.
 *
 * @property updated Ocorrência atualizada com o interveniente adicionado.
 * @property userOccurrences Lista atualizada de todas as ocorrências do utilizador.
 *
 * @see Occurrence
 * @see Intervenor
 */
data class IntervenorAddResult(
    val updated: Occurrence,
    val userOccurrences: List<Occurrence>,
)
