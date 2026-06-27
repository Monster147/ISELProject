package pt.ira.evidence

import pt.ira.occurrence.Occurrence

/**
 * Resultado da atualização de uma evidência.
 *
 * Agrega os dados necessários para notificar o utilizador após uma atualização de evidência,
 * incluindo o identificador do utilizador, a ocorrência afetada, a evidência atualizada
 * e a lista atualizada de evidências do utilizador.
 *
 * @property reporterId Identificador do utilizador que reportou a evidência.
 * @property occurrenceId Identificador da ocorrência à qual a evidência está associada.
 * @property evidence Evidência com os dados atualizados.
 * @property occurrence Ocorrência associada à evidência atualizada.
 * @property reporterEvidences Lista atualizada de todas as evidências do utilizador.
 *
 * @see Evidence
 * @see Occurrence
 */
data class EvidenceUpdateResult(
    val reporterId: Int,
    val occurrenceId: Int,
    val evidence: Evidence,
    val occurrence: Occurrence,
    val reporterEvidences: List<Evidence>,
)
