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
    private val root = Paths.get(System.getProperty("user.dir")).resolve("uploads")

    init {
        Files.createDirectories(root)
    }

    override fun save(
        occurrenceId: Int,
        file: MultipartFile,
    ): String {
        val reportDir =
            root
                .resolve("occurrences")
                .resolve(occurrenceId.toString())
                .resolve("evidences")
        Files.createDirectories(reportDir)

        val extension =
            file.originalFilename
                ?.substringAfterLast('.', "")
                ?.let { ".$it" } ?: ""

        val destination = generateUniquePath(reportDir, extension)

        file.inputStream.use {
            Files.copy(it, destination)
        }

        return root.relativize(destination).toString()
    }

    private fun generateUniquePath(
        dir: Path,
        extension: String,
    ): Path {
        val path = dir.resolve("${UUID.randomUUID()}$extension")
        return if (!Files.exists(path)) path else generateUniquePath(dir, extension)
    }

    override fun load(path: String): Resource? {
        val filePath = root.resolve(path).normalize()
        if (!filePath.startsWith(root)) return null
        val resource = UrlResource(filePath.toUri())
        return if (resource.exists() || resource.isReadable) {
            resource
        } else {
            null
        }
    }

    override fun deleteEvidence(path: String): Boolean {
        val filePath = root.resolve(path).normalize()
        if (!filePath.startsWith(root)) return false
        return try {
            Files.deleteIfExists(filePath)
        } catch (e: Exception) {
            false
        }
    }

    override fun deleteOccurrenceEvidences(occurrenceId: Int): Boolean {
        val reportDir =
            root
                .resolve("occurrences")
                .resolve(occurrenceId.toString())
                .normalize()
        if (!reportDir.startsWith(root)) return false

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
