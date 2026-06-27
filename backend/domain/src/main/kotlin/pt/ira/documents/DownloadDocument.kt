package pt.ira.documents

import org.springframework.core.io.Resource

/**
 * Resultado do download de um documento.
 *
 * Agrega os metadados do documento e o recurso de ficheiro associado,
 * permitindo ao controller construir a resposta HTTP de download com as
 * informações necessárias (nome do ficheiro, tipo MIME, etc.).
 *
 * @property document Metadados do documento.
 * @property resource Recurso de ficheiro associado ao documento.
 *
 * @see Documents
 */
data class DownloadDocument(
    val document: Documents,
    val resource: Resource,
)
