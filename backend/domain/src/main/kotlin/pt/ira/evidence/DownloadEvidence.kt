package pt.ira.evidence

import org.springframework.core.io.Resource

/**
 * Resultado da download de uma evidência.
 *
 * Agrega os metadados da evidência e o recurso de ficheiro associado,
 * permitindo ao controller construir a resposta HTTP de download com as
 * informações necessárias (nome do ficheiro, tipo MIME, etc.).
 *
 * @property evidence Metadados da evidência.
 * @property resource Recurso de ficheiro associado à evidência.
 *
 * @see Evidence
 */
data class DownloadEvidence(
    val evidence: Evidence,
    val resource: Resource,
)
