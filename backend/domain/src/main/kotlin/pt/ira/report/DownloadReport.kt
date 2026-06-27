package pt.ira.report

import org.springframework.core.io.Resource

/**
 * Resultado do download de um relatório.
 *
 * Agrega os metadados do relatório e o recurso de ficheiro PDF associado,
 * permitindo ao controller construir a resposta HTTP de download com as
 * informações necessárias (nome do ficheiro, tipo MIME, etc.).
 *
 * @property report Metadados do relatório.
 * @property resource Recurso de ficheiro PDF associado ao relatório.
 *
 * @see Report
 */
data class DownloadReport(
    val report: Report,
    val resource: Resource,
)
