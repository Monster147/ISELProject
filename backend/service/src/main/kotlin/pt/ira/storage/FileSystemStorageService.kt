package pt.ira.storage

import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.UUID

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

    init {
        Files.createDirectories(rootEvidence)
    }

    /**
     * Armazena uma evidência no sistema de ficheiros, organizando-a sob a ocorrência específica.
     *
     * Cria uma estrutura de diretórios hierárquica e garante que não existem conflitos de nomes
     * através de geração automática de sufixos.
     *
     * @param occurrenceId Identificador da ocorrência à qual a evidência está associada.
     * @param file Ficheiro da evidência a ser armazenado.
     * @return Caminho relativo (em relação a `rootEvidence`) onde o ficheiro foi guardado.
     */
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

    /**
     * Armazena um documento de apoio no sistema de ficheiros, organizando-o por categoria.
     *
     * Documentos são guardados em diretórios segregados pela sua categoria (ex: "Automovel", "Pessoal").
     * Não sobrescreve ficheiros existentes com o mesmo nome.
     *
     * @param file Ficheiro do documento a ser armazenado.
     * @param documentName Nome descritivo do documento (será utilizado como nome do ficheiro base).
     * @param documentType Categoria do documento (cria subdiretório correspondente).
     * @return Caminho relativo (em relação a `rootDocuments`) onde o ficheiro foi guardado,
     *         ou string vazia se o ficheiro já existe.
     */
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

    /**
     * Carrega uma evidência do sistema de ficheiros.
     *
     * Valida o caminho para prevenir path traversal attacks, garantindo que
     * o ficheiro solicitado encontra-se dentro do diretório de evidências.
     *
     * @param path Caminho relativo (em relação a `rootEvidence`) do ficheiro a carregar.
     * @return [Resource] representando o ficheiro, ou null se não for encontrado ou legível.
     */
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

    /**
     * Carrega um documento do sistema de ficheiros.
     *
     * Valida o caminho para prevenir path traversal attacks, garantindo que
     * o ficheiro solicitado encontra-se dentro do diretório de documentos.
     *
     * @param path Caminho relativo (em relação a `rootDocuments`) do ficheiro a carregar.
     * @return [Resource] representando o ficheiro, ou null se não for encontrado ou legível.
     */
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

    /**
     * Elimina uma evidência do sistema de ficheiros.
     *
     * Valida o caminho antes de eliminar para prevenir acessos indevidos.
     *
     * @param path Caminho relativo (em relação a `rootEvidence`) do ficheiro a eliminar.
     * @return true se a eliminação foi bem-sucedida, false caso contrário.
     */
    override fun deleteEvidence(path: String): Boolean {
        val filePath = rootEvidence.resolve(path).normalize()
        if (!filePath.startsWith(rootEvidence)) return false
        return try {
            Files.deleteIfExists(filePath)
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Elimina um documento do sistema de ficheiros.
     *
     * Valida o caminho antes de eliminar para prevenir acessos indevidos.
     *
     * @param path Caminho relativo (em relação a `rootDocuments`) do ficheiro a eliminar.
     * @return true se a eliminação foi bem-sucedida, false caso contrário.
     */
    override fun deleteDocument(path: String): Boolean {
        val filePath = rootDocuments.resolve(path).normalize()
        if (!filePath.startsWith(rootDocuments)) return false
        return try {
            Files.deleteIfExists(filePath)
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Atualiza um ficheiro de evidência existente, reescrevendo-o completamente.
     *
     * @param path Caminho relativo do ficheiro a reescrever.
     * @param file Novo ficheiro com conteúdo atualizado.
     * @return true se a atualização foi bem-sucedida, false caso contrário.
     */
    override fun updateEvidence(
        path: String,
        file: MultipartFile
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

    /**
     * Elimina todas as evidências associadas a uma ocorrência específica.
     *
     * Remove recursivamente todo o diretório da ocorrência, incluindo todas as suas evidências.
     * Valida o caminho para prevenir acessos indevidos.
     *
     * @param occurrenceId Identificador da ocorrência cujas evidências serão eliminadas.
     * @return true se todas as eliminações foram bem-sucedidas, false caso contrário.
     */
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
