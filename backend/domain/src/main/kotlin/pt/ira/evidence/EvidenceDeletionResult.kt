package pt.ira.evidence

import pt.ira.occurrence.Occurrence

/**
 * Resultado da eliminação de uma evidência.
 *
 * Agrega o identificador do utilizador que reportou a evidência eliminada,
 * a lista atualizada das suas evidências e a lista atualizada das suas ocorrências,
 * permitindo notificar o utilizador após a remoção.
 *
 * @property reporterId Identificador do utilizador que reportou a evidência eliminada.
 * @property evidences Lista atualizada de evidências do utilizador após a eliminação.
 * @property occurrences Lista atualizada de ocorrências do utilizador após a eliminação.
 *
 * @see Evidence
 * @see Occurrence
 */
data class EvidenceDeletionResult(
    val reporterId: Int,
    val evidences: List<Evidence>,
    val occurrences: List<Occurrence>,
)
