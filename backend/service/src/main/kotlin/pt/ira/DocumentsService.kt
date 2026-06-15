package pt.ira

import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import pt.ira.documents.Documents
import pt.ira.documents.DownloadDocument
import pt.ira.emitters.ActionKind
import pt.ira.interfaces.TransactionManager
import pt.ira.publishers.Publishers
import pt.ira.storage.StorageService
import java.text.Normalizer

/**
 * Hierarquia de erros específicos do domínio dos documentos.
 *
 * Encapsula as situações de erro que podem ocorrer durante operações com documentos,
 * permitindo um tratamento explícito e tipificado dos cenários de falha.
 *
 * @see DocumentsService
 */
sealed class DocumentsError {
    /**
     * Indica que o documento solicitado não foi encontrado na base de dados.
     */
    data object DocumentNotFound : DocumentsError()

    /**
     * Indica que o ficheiro fornecido é inválido (tipo não permitido ou vazio).
     */
    data object InvalidFile : DocumentsError()

    /**
     * Indica que um documento com o mesmo nome já existe no armazenamento.
     */
    data object FileAlreadyExists : DocumentsError()

    /**
     * Indica que o documento não conseguiu ser registado na base de dados
     */
    data object UploadFailed : DocumentsError()
}

/**
 * Serviço responsável pela gestão do ciclo de vida dos documentos.
 *
 * Responsabilidades principais:
 * - criação, consulta e eliminação de documentos;
 * - validação e armazenamento de ficheiros;
 * - persistência de metadados dos documentos na base de dados.
 *
 * @param trxManager gestor de transações usado para aceder aos repositórios dentro de unidades de trabalho.
 * @param storageService serviço responsável pelo armazenamento físico dos ficheiros.
 * @param publishers conjunto de publicadores de eventos do sistema.
 */
@Component
class DocumentsService(
    private val trxManager: TransactionManager,
    private val storageService: StorageService,
    private val publishers: Publishers,
) {
    companion object {
        private val allowedExtensions =
            listOf(
                "application/pdf",
                "image/jpg",
                "image/jpeg",
                "image/png",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )

        private val DIACRITICS_REGEX =
            "\\p{InCombiningDiacriticalMarks}+".toRegex()

        private val INVALID_FILENAME_REGEX =
            "[^a-zA-Z0-9._-]".toRegex()
    }

    private fun isInvalidDocument(
        file: MultipartFile,
        name: String,
        type: String,
    ): Boolean = file.isEmpty || file.contentType == null || file.contentType !in allowedExtensions || name.isBlank() || type.isBlank()

    /**
     * Faz *upload* de um documento.
     *
     * Valida o tipo de ficheiro, armazena-o no sistema de ficheiros
     * e persiste os metadados na base de dados.
     *
     * @param name Nome do documento.
     * @param type Categoria do documento (ex. "Automovel").
     * @param file Ficheiro a fazer upload.
     *
     * @return [Documents] criado, ou um erro do tipo [DocumentsError].
     */
    fun uploadDocument(
        name: String,
        type: String,
        file: MultipartFile,
    ): Either<DocumentsError, Documents> {
        if (isInvalidDocument(file, name, type)) {
            return failure(DocumentsError.InvalidFile)
        }

        val safeName = normalizeFileName(name)

        val filepath =
            storageService.saveDocument(file, safeName, type)

        if (filepath.isEmpty()) {
            return failure(DocumentsError.FileAlreadyExists)
        }

        try {
            val document =
                trxManager.run {
                    repoDocuments.uploadDocumentInfo(
                        name = safeName,
                        type = type,
                        filepath = filepath,
                    )
                }
            publishers.documentsPublisher.sendMessageToAll(
                findAllDocuments(),
                ActionKind.DocumentsChanged,
            )
            return success(document)
        } catch (e: Exception) {
            storageService.deleteDocument(filepath)
            return failure(DocumentsError.UploadFailed)
        }
    }

    /**
     * Obtém um documento pelo seu identificador.
     *
     * @param id Identificador do documento.
     *
     * @return [Documents] correspondente, ou erro do tipo [DocumentsError].
     */
    fun findDocumentById(id: Int): Either<DocumentsError, Documents> =
        trxManager.run {
            val document = repoDocuments.findById(id) ?: return@run failure(DocumentsError.DocumentNotFound)
            success(document)
        }

    /**
     * Obtém um documento pelo seu nome.
     *
     * @param name Nome do documento.
     *
     * @return [Documents] correspondente, ou erro do tipo [DocumentsError].
     */
    fun findDocumentByName(name: String): Either<DocumentsError, Documents> =
        trxManager.run {
            val document = repoDocuments.findByName(name) ?: return@run failure(DocumentsError.DocumentNotFound)
            success(document)
        }

    /**
     * Obtém todos os documentos de um determinado tipo.
     *
     * @param type Tipo do documento.
     *
     * @return Lista de [Documents] do tipo especificado.
     */
    fun findDocumentsByType(type: String): Either<DocumentsError, List<Documents>> =
        trxManager.run {
            val documents = repoDocuments.findByType(type)
            if (documents.isEmpty()) {
                failure(DocumentsError.DocumentNotFound)
            } else {
                success(documents)
            }
        }

    /**
     * Obtém todos os tipos de documentos disponíveis.
     *
     * @return Lista de tipos únicos.
     */
    fun findAllDocumentTypes(): List<String> =
        trxManager.run {
            repoDocuments.findAllTypes()
        }

    /**
     * Obtém todos os documentos.
     *
     * @return Lista de todos os [Documents].
     */
    fun findAllDocuments(): List<Documents> =
        trxManager.run {
            repoDocuments.findAll()
        }

    /**
     * Elimina um documento.
     *
     * Remove o ficheiro do sistema de ficheiros e elimina os metadados da base de dados.
     *
     * @param id Identificador do documento a eliminar.
     *
     * @return `true` se eliminado com sucesso, ou erro do tipo [DocumentsError].
     */
    fun deleteDocument(id: Int): Either<DocumentsError, Boolean> {
        val result =
            trxManager.run {
                val document = repoDocuments.findById(id) ?: return@run failure(DocumentsError.DocumentNotFound)
                storageService.deleteDocument(document.filepath)
                repoDocuments.deleteById(id)
                success(repoDocuments.findAll())
            }

        if (result is Failure) {
            return result
        }

        publishers.documentsPublisher.sendMessageToAll(
            findAllDocuments(),
            ActionKind.DocumentsChanged,
        )

        return success(true)
    }

    /**
     * Faz *download* de um documento.
     *
     * Carrega o ficheiro do sistema de ficheiros usando o caminho armazenado.
     *
     * @param id Identificador do documento a fazer download.
     *
     * @return [DownloadDocument] correspondente ao ficheiro, ou erro do tipo [DocumentsError].
     */
    fun downloadDocument(id: Int): Either<DocumentsError, DownloadDocument> =
        trxManager.run {
            val document =
                repoDocuments.findById(id)
                    ?: return@run failure(DocumentsError.DocumentNotFound)

            val resource =
                storageService.loadDocument(document.filepath)
                    ?: return@run failure(DocumentsError.DocumentNotFound)

            success(DownloadDocument(document, resource))
        }

    private fun normalizeFileName(filename: String): String {
        val normalizer = Normalizer.normalize(filename, Normalizer.Form.NFD)
        return normalizer
            .replace(DIACRITICS_REGEX, "")
            .replace(INVALID_FILENAME_REGEX, "_")
    }
}
