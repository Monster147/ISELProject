package pt.ira.storage

import org.apache.pdfbox.pdmodel.PDDocument
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption

/**
 * Implementação de [StorageService] que persiste ficheiros no sistema de ficheiros.
 *
 * Gere o armazenamento de evidências (associadas a ocorrências) e documentos corporativos,
 * organizando-os em estruturas de diretórios hierárquicas. Implementa mecanismos de segurança
 * como validação de caminhos e geração de nomes únicos para evitar conflitos de sobreposição.
 *
 * Estrutura de armazenamento:
 * - Evidências: `uploads/occurrences/{occurrenceId}/evidences/`
 * - Documentos: `documents/{documentType}/`
 *
 * @see StorageService
 * @see UrlResource
 */

@Component
class FileSystemStorageService : StorageService {
    private val rootEvidence = Paths.get(System.getProperty("user.dir")).resolve("uploads")
    private val rootDocuments = Paths.get(System.getProperty("user.dir")).resolve("documents")
    private val rootReports = Paths.get(System.getProperty("user.dir")).resolve("reports")

    init {
        Files.createDirectories(rootEvidence)
        Files.createDirectories(rootDocuments)
        Files.createDirectories(rootReports)
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

    override fun saveReport(
        fileName: String,
        document: PDDocument,
    ): String {
        val reportDir = rootReports
        Files.createDirectories(reportDir)

        val destination = reportDir.resolve(fileName)

        if (Files.exists(destination)) {
            return ""
        }

        document.save(destination.toFile())

        return rootReports.relativize(destination).toString()
    }

    /**
     * Gera um caminho único para um ficheiro, adicionando sufixos numerados caso já exista.
     *
     * Implementação recursiva que evita conflitos de sobreposição de ficheiros com o mesmo nome,
     * criando variações como "documento.pdf", "documento(1).pdf", "documento(2).pdf" ...
     *
     * @param dir Diretório onde o ficheiro será guardado.
     * @param originalFileName Nome original do ficheiro com extensão.
     * @param counter Contador interno utilizado para recursão (não deve ser fornecido manualmente).
     * @return Caminho completo garantidamente único no diretório especificado.
     */
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

    override fun updateEvidence(
        path: String,
        file: MultipartFile,
    ): Boolean {
        val filePath = rootEvidence.resolve(path).normalize()
        if (!filePath.startsWith(rootEvidence)) return false
        if (!Files.exists(filePath)) return false

        try {
            file.inputStream.use {
                Files.copy(it, filePath, StandardCopyOption.REPLACE_EXISTING)
            }
            return true
        } catch (e: Exception) {
            return false
        }
    }

    override fun deleteReport(path: String): Boolean {
        val filePath = rootReports.resolve(path).normalize()
        if (!filePath.startsWith(rootReports)) return false
        return try {
            Files.deleteIfExists(filePath)
        } catch (e: Exception) {
            false
        }
    }

    override fun updateReport(
        path: String,
        document: PDDocument,
    ): Boolean {
        val filePath = rootReports.resolve(path).normalize()
        if (!filePath.startsWith(rootReports) || !Files.exists(filePath)) return false
        return try {
            document.save(filePath.toFile())
            true
        } catch (e: Exception) {
            false
        }
    }

    override fun loadReport(path: String): Resource? {
        val filePath = rootReports.resolve(path).normalize()
        if (!filePath.startsWith(rootReports)) return null
        val resource = UrlResource(filePath.toUri())
        return if (resource.exists() || resource.isReadable) {
            resource
        } else {
            null
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
