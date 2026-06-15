package pt.ira.documents

import org.springframework.core.io.Resource

data class DownloadDocument(
    val document: Documents,
    val resource: Resource,
)
