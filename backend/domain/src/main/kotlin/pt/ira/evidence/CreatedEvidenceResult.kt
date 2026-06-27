package pt.ira.evidence

import pt.ira.occurrence.Occurrence

/**
 * Resultado da criação de uma evidência.
 *
 * Agrega a evidência criada, a lista atualizada de evidências do utilizador,
 * a ocorrência atualizada (com a evidência associada) e a lista de todas as
 * ocorrências do utilizador, permitindo notificar o cliente com todos os dados
 * relevantes numa única operação.
 *
 * @property evidence Evidência criada.
 * @property reporterEvidences Lista atualizada de todas as evidências do utilizador.
 * @property updatedOccurrence Ocorrência atualizada com a nova evidência associada.
 * @property occurrences Lista atualizada de todas as ocorrências do utilizador.
 *
 * @see Evidence
 * @see Occurrence
 */
data class CreatedEvidenceResult(
    val evidence: Evidence,
    val reporterEvidences: List<Evidence>,
    val updatedOccurrence: Occurrence,
    val occurrences: List<Occurrence>,
)
