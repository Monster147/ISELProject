package pt.ira

import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import pt.ira.documents.Documents
import pt.ira.model.Problem
import pt.ira.model.documents.DocumentInputModel
import pt.ira.publishers.Publishers
import java.nio.file.Paths

/**
 * Controlador REST responsável pela gestão de documentos no sistema.
 *
 * Expõe endpoints HTTP para *upload*, consulta e eliminação de documentos,
 * bem como listagem de tipos de documentos disponíveis.
 *
 * Atua como camada de adaptação entre o protocolo HTTP e a lógica de domínio,
 * delegando toda a execução ao [DocumentsService] e convertendo resultados em respostas HTTP
 * com mapeamento explícito de erros de domínio.
 *
 * Responsabilidades principais:
 * - *upload* de documentos;
 * - obtenção de documentos por identificador, nome ou tipo;
 * - consulta de tipos de documentos disponíveis;
 * - eliminação de documentos;
 * - tradução de erros de domínio para respostas HTTP consistentes.
 *
 * @param documentsService serviço responsável pela lógica de negócio associada aos documentos.
 */
@RestController
@RequestMapping("/api/documents")
class DocumentsController(
    private val documentsService: DocumentsService,
    private val publisher: Publishers,
) {
    /**
     * Faz *upload* de um documento.
     *
     * Em caso de sucesso, devolve `201 Created` com o header `Location`
     * a apontar para o recurso criado.
     *
     * @param file ficheiro a fazer upload.
     * @param data dados necessários para a criação do documento.
     *
     * @return resposta HTTP com o resultado da operação.
     */
    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadDocument(
        @RequestPart("file") file: MultipartFile,
        @RequestPart("data") data: DocumentInputModel,
    ): ResponseEntity<*> {
        val result =
            documentsService.uploadDocument(
                data.name,
                data.type,
                file,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header(
                        "Location",
                        "/api/documents/${result.value.id}",
                    ).build<Unit>()

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Obtém um documento pelo seu identificador.
     *
     * @param id identificador do documento.
     *
     * @return `200 OK` com o documento ou `404 Not Found` se não existir.
     */
    @GetMapping("/{id}")
    fun getDocumentById(
        @PathVariable("id") id: Int,
    ): ResponseEntity<*> {
        val result = documentsService.findDocumentById(id)

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Obtém um documento pelo seu nome.
     *
     * @param name nome do documento.
     *
     * @return `200 OK` com o documento ou `404 Not Found` se não existir.
     */
    @GetMapping("/name/{name}")
    fun getDocumentByName(
        @PathVariable("name") name: String,
    ): ResponseEntity<*> {
        val result = documentsService.findDocumentByName(name)

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Obtém todos os documentos de um determinado tipo.
     *
     * @param type tipo do documento.
     *
     * @return `200 OK` com a lista de documentos ou `404 Not Found` se não houver documentos desse tipo.
     */
    @GetMapping("/type/{type}")
    fun getDocumentsByType(
        @PathVariable("type") type: String,
    ): ResponseEntity<*> {
        val result = documentsService.findDocumentsByType(type)

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Obtém todos os tipos de documentos disponíveis.
     *
     * @return `200 OK` com a lista de tipos únicos.
     */
    @GetMapping("/types")
    fun getAllDocumentTypes(): ResponseEntity<List<String>> {
        val types = documentsService.findAllDocumentTypes()
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(types)
    }

    /**
     * Obtém todos os documentos.
     *
     * @return `200 OK` com a lista de todos os documentos.
     */
    @GetMapping
    fun getAllDocuments(): ResponseEntity<List<Documents>> {
        val documents = documentsService.findAllDocuments()
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(documents)
    }

    /**
     * Faz *download* de um documento.
     *
     * @param id identificador do documento a fazer download.
     *
     * @return `200 OK` com o ficheiro do documento ou `404 Not Found` se não existir.
     */
    @GetMapping("/{id}/download")
    fun downloadDocument(
        @PathVariable("id") id: Int,
    ): ResponseEntity<*> {
        val result = documentsService.downloadDocument(id)

        return when (result) {
            is Success -> {
                val (document, resource) = result.value
                val path = Paths.get(document.filepath)
                val contentType = resolveContentType(path)
                ResponseEntity
                    .status(HttpStatus.OK)
                    .contentType(contentType)
                    .header(
                        "Content-Disposition",
                        "attachment; filename=\"${document.name}\"",
                    )
                    .body(resource)
            }

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Elimina um documento.
     *
     * @param id identificador do documento a eliminar.
     *
     * @return `200 OK` se eliminado com sucesso ou `404 Not Found` se não existir.
     */
    @DeleteMapping("/{id}")
    fun deleteDocument(
        @PathVariable("id") id: Int,
    ): ResponseEntity<*> {
        val result = documentsService.deleteDocument(id)

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.NO_CONTENT).build<Unit>()

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Fornece um endpoint SSE para subscrição de alterações na lista global de documentos.
     *
     * Permite receber eventos em tempo real sempre que a lista de documentos é atualizada.
     *
     * Endpoint: GET /listen
     *
     * @return [SseEmitter] com ligação persistente para eventos globais.
     */
    @GetMapping("/listen")
    fun listenDocuments(): SseEmitter {
        val sseEmitter = SseEmitter(Long.MAX_VALUE)
        publisher.documentsPublisher.addEmitter(
            SSEUpdatedDataAdapter(
                sseEmitter,
            ),
        )
        return sseEmitter
    }

    /**
     * Converte um erro de domínio [DocumentsError] na resposta HTTP correspondente.
     *
     * Mapeamento de erros:
     * - [DocumentsError.DocumentNotFound] → 404 Not Found
     * - [DocumentsError.InvalidFile] → 400 Bad Request
     * - [DocumentsError.FileAlreadyExists] → 409 Conflict
     * - [DocumentsError.UploadFailed] → 500 Internal Server Error
     *
     * @receiver Erro de domínio a converter.
     * @return [ResponseEntity] com o [Problem] e o código HTTP adequados.
     */
    private fun DocumentsError.toResponse(): ResponseEntity<*> =
        when (this) {
            is DocumentsError.DocumentNotFound -> Problem.FileNotFound.response(HttpStatus.NOT_FOUND)
            is DocumentsError.InvalidFile -> Problem.InvalidFile.response(HttpStatus.BAD_REQUEST)
            is DocumentsError.FileAlreadyExists -> Problem.FileAlreadyExists.response(HttpStatus.CONFLICT)
            is DocumentsError.UploadFailed -> Problem.UploadFailed.response(HttpStatus.INTERNAL_SERVER_ERROR)
            else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
        }
}
