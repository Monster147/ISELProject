package pt.ira.storage

import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.UUID

@Component
class FileSystemStorageService : StorageService {
    private val rootEvidence = Paths.get(System.getProperty("user.dir")).resolve("uploads")
    private val rootDocuments = Paths.get(System.getProperty("user.dir")).resolve("documents")

    init {
        Files.createDirectories(rootEvidence)
    }

    override fun save(
        occurrenceId: Int,
        file: MultipartFile,
    ): String {
        val reportDir =
            rootEvidence
                .resolve("occurrences")
                .resolve(occurrenceId.toString())
                .resolve("evidences")
        Files.createDirectories(reportDir)

        val originalFileName = file.originalFilename ?: return ""

        val destination = generateUniquePath(reportDir, originalFileName)

        file.inputStream.use {
            Files.copy(it, destination)
        }

        return rootEvidence.relativize(destination).toString()
    }

    override fun saveDocument(
        file: MultipartFile,
        documentName: String,
        documentType: String,
    ): String {
        val docDir =
            rootDocuments
                .resolve(documentType)
        Files.createDirectories(docDir)

        val extension =
            file.originalFilename
                ?.substringAfterLast('.', "")
                ?.let { ".$it" } ?: ""

        val destination = docDir.resolve("${documentName}$extension")

        if (Files.exists(destination)) {
            return ""
        }

        file.inputStream.use {
            Files.copy(it, destination)
        }

        return rootDocuments.relativize(destination).toString()
    }

    private fun generateUniquePath(
        dir: Path,
        originalFileName: String,
        counter: Int = 0,
    ): Path {
        val baseName =
            originalFileName.substringBeforeLast('.', originalFileName)

        val extension =
            originalFileName.substringAfterLast('.', "")

        val suffix =
            if (counter == 0) {
                ""
            } else {
                "($counter)"
            }

        val fileName =
            if (extension.isBlank()) {
                "$baseName$suffix"
            } else {
                "$baseName$suffix.$extension"
            }

        val path = dir.resolve(fileName)

        return if (!Files.exists(path)) {
            path
        } else {
            generateUniquePath(
                dir,
                originalFileName,
                counter + 1,
            )
        }
    }

    override fun loadEvidence(path: String): Resource? {
        val filePath = rootEvidence.resolve(path).normalize()
        if (!filePath.startsWith(rootEvidence)) return null
        val resource = UrlResource(filePath.toUri())
        return if (resource.exists() || resource.isReadable) {
            resource
        } else {
            null
        }
    }

    override fun loadDocument(path: String): Resource? {
        val filePath = rootDocuments.resolve(path).normalize()
        if (!filePath.startsWith(rootDocuments)) return null
        val resource = UrlResource(filePath.toUri())
        return if (resource.exists() || resource.isReadable) {
            resource
        } else {
            null
        }
    }

    override fun deleteEvidence(path: String): Boolean {
        val filePath = rootEvidence.resolve(path).normalize()
        if (!filePath.startsWith(rootEvidence)) return false
        return try {
            Files.deleteIfExists(filePath)
        } catch (e: Exception) {
            false
        }
    }

    override fun deleteDocument(path: String): Boolean {
        val filePath = rootDocuments.resolve(path).normalize()
        if (!filePath.startsWith(rootDocuments)) return false
        return try {
            Files.deleteIfExists(filePath)
        } catch (e: Exception) {
            false
        }
    }

    override fun deleteOccurrenceEvidences(occurrenceId: Int): Boolean {
        val reportDir =
            rootEvidence
                .resolve("occurrences")
                .resolve(occurrenceId.toString())
                .normalize()
        if (!reportDir.startsWith(rootEvidence)) return false

        return try {
            Files.walk(reportDir)
                .sorted(Comparator.reverseOrder())
                .forEach(Files::deleteIfExists)
            true
        } catch (e: Exception) {
            false
        }
    }
}
