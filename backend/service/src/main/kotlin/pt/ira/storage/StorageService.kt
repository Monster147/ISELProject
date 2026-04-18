package pt.ira.storage

import org.springframework.core.io.Resource
import org.springframework.web.multipart.MultipartFile

interface StorageService {
    fun save(
        occurrenceId: Int,
        file: MultipartFile,
    ): String

    fun saveDocument(
        file: MultipartFile,
        documentName: String,
        documentType: String,
    ): String

    fun loadEvidence(path: String): Resource?

    fun loadDocument(path: String): Resource?

    fun deleteEvidence(path: String): Boolean

    fun deleteOccurrenceEvidences(occurrenceId: Int): Boolean

    fun deleteDocument(path: String): Boolean
}
