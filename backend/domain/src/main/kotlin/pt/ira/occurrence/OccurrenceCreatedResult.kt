package pt.ira.occurrence

/**
 * Resultado da criação de uma ocorrência.
 *
 * Agrega a ocorrência recém-criada e a lista atualizada de todas as ocorrências
 * do utilizador que a registou, permitindo notificar o utilizador com ambos os dados
 * numa única operação.
 *
 * @property occurrence Ocorrência criada.
 * @property userOccurrences Lista atualizada de todas as ocorrências do utilizador.
 *
 * @see Occurrence
 */
data class OccurrenceCreatedResult(
    val occurrence: Occurrence,
    val userOccurrences: List<Occurrence>,
)
