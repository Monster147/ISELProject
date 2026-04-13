package pt.ira.storage

import org.springframework.core.io.Resource
import org.springframework.web.multipart.MultipartFile

interface StorageService {
    fun save(
        occurrenceId: Int,
        file: MultipartFile,
    ): String

    fun load(path: String): Resource?

    fun deleteEvidence(path: String): Boolean

    fun deleteOccurrenceEvidences(occurrenceId: Int): Boolean
}
