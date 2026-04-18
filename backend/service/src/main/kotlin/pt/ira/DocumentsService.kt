package pt.ira

import org.springframework.core.io.Resource
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import pt.ira.documents.Documents
import pt.ira.emitters.ActionKind
import pt.ira.interfaces.TransactionManager
import pt.ira.publishers.Publishers
import pt.ira.storage.StorageService

sealed class DocumentsError {
    data object DocumentNotFound : DocumentsError()

    data object InvalidFile : DocumentsError()

    data object FileAlreadyExists : DocumentsError()
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
 * @param publisher conjunto de publicadores de eventos do sistema.
 */
@Component
class DocumentsService(
    private val trxManager: TransactionManager,
    private val storageService: StorageService,
    private val publishers: Publishers,
) {
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

    /**
     * Faz upload de um documento.
     *
     * Valida o tipo de ficheiro, armazena-o no sistema de ficheiros
     * e persiste os metadados na base de dados.
     *
     * @param name Nome do documento.
     * @param file Ficheiro a fazer upload.
     *
     * @return [Documents] criado, ou um erro do tipo [DocumentsError].
     */
    fun uploadDocument(
        name: String,
        type: String,
        file: MultipartFile,
    ): Either<DocumentsError, Documents> {
        if (file.contentType == null || file.contentType !in allowedExtensions) {
            return failure(DocumentsError.InvalidFile)
        }

        if (file.isEmpty) {
            return failure(DocumentsError.InvalidFile)
        }

        val filepath =
            storageService.saveDocument(file, name, type)

        if (filepath.isEmpty()) {
            return failure(DocumentsError.FileAlreadyExists)
        }

        return trxManager.run {
            val document =
                repoDocuments.uploadDocumentInfo(
                    name = name,
                    type = type,
                    filepath = filepath,
                )

            publishers.documentsPublisher.sendMessageToAll(
                findAllDocuments(),
                ActionKind.DocumentsChanged
            )
            success(document)
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
            val document = repoDocuments.findById(id)
            if (document == null) {
                failure(DocumentsError.DocumentNotFound)
            } else {
                success(document)
            }
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
            val document = repoDocuments.findByName(name)
            if (document == null) {
                failure(DocumentsError.DocumentNotFound)
            } else {
                success(document)
            }
        }

    /**
     * Obtém todos os documentos de um determinado tipo.
     *
     * @param type Tipo MIME do documento.
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
     * @return Lista de tipos MIME únicos.
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
    fun deleteDocument(id: Int): Either<DocumentsError, Boolean> =
        trxManager.run {
            val document =
                repoDocuments.findById(id)
                    ?: return@run failure(DocumentsError.DocumentNotFound)

            storageService.deleteDocument(document.filepath)

            repoDocuments.deleteById(id)

            publishers.documentsPublisher.sendMessageToAll(
                findAllDocuments(),
                ActionKind.DocumentsChanged
            )
            success(true)
        }

    /**
     * Faz download de um documento.
     *
     * Carrega o ficheiro do sistema de ficheiros usando o caminho armazenado.
     *
     * @param id Identificador do documento a fazer download.
     *
     * @return [Resource] correspondente ao ficheiro, ou erro do tipo [DocumentsError].
     */
    fun downloadDocument(id: Int): Either<DocumentsError, Pair<Documents, Resource>> =
        trxManager.run {
            val document =
                repoDocuments.findById(id)
                    ?: return@run failure(DocumentsError.DocumentNotFound)

            val resource =
                storageService.loadDocument(document.filepath)
                    ?: return@run failure(DocumentsError.DocumentNotFound)

            success(Pair(document, resource))
        }
}
