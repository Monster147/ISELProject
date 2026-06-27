package pt.ira.occurrence

/**
 * Resultado da eliminação de uma ocorrência.
 *
 * Agrega o identificador do utilizador que registou a ocorrência eliminada e a lista
 * atualizada das suas ocorrências, permitindo notificar o utilizador após a remoção.
 *
 * @property reporterId Identificador do utilizador que registou a ocorrência eliminada.
 * @property occurrences Lista atualizada de ocorrências do utilizador após a eliminação.
 *
 * @see Occurrence
 */
data class OccurrenceDeleteResult(
    val reporterId: Int,
    val occurrences: List<Occurrence>,
)
