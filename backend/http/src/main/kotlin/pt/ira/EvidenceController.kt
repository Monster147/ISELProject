package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import pt.ira.model.Problem
import pt.ira.model.evidence.CreateEvidenceInput
import pt.ira.publishers.Publishers
import java.nio.file.Paths

/**
 * Controlador REST responsável pela exposição dos endpoints HTTP
 * relacionados com a gestão de evidências.
 *
 * Atua como camada de adaptação entre o protocolo HTTP e a lógica de negócio,
 * delegando operações no [EvidenceService] e convertendo resultados em
 * respostas HTTP apropriadas.
 *
 * Responsabilidades principais:
 * - receção e validação de pedidos HTTP (incluindo multipart/form-data);
 * - mapeamento de resultados de domínio para códigos de estado HTTP;
 * - serialização de respostas e gestão de headers (ex.: Location, Content-Disposition);
 * - disponibilização de endpoints de consulta, criação, download e eliminação;
 * - suporte a Server-Sent Events (SSE) para notificações em tempo real.
 *
 * @param evidenceService serviço responsável pela lógica de negócio associada às evidências.
 * @param publisher conjunto de publicadores utilizados para gerir subscrições SSE.
 */
@RestController
@RequestMapping("/api/evidence")
class EvidenceController(
    private val evidenceService: EvidenceService,
    private val publisher: Publishers,
) {
    /**
     * Cria uma evidência a partir de um pedido multipart.
     *
     * O pedido deve conter:
     * - um ficheiro ("file");
     * - um objeto JSON ("data") com os metadados da evidência.
     *
     * Em caso de sucesso, devolve `201 Created` com o header `Location`
     * a apontar para o recurso criado.
     *
     * @param file ficheiro associado à evidência.
     * @param data dados necessários para criação da evidência.
     *
     * @return resposta HTTP com o resultado da operação.
     */
    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun createEvidence(
        @RequestPart("file") file: MultipartFile,
        @RequestPart("data") data: CreateEvidenceInput,
    ): ResponseEntity<*> {
        val result =
            evidenceService.createEvidence(
                data.type,
                file,
                data.location,
                data.description,
                data.reporterId,
                data.occurrenceId,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header(
                        "Location",
                        "/api/evidence/${result.value.id}",
                    ).build<Unit>()
            is Failure ->
                when (result.value) {
                    is EvidenceError.OccurrenceNotFound ->
                        Problem.OccurrenceNotFound.response(HttpStatus.NOT_FOUND)
                    is EvidenceError.ReporterNotFound ->
                        Problem.ReporterNotFound.response(HttpStatus.NOT_FOUND)
                    is EvidenceError.InvalidFile ->
                        Problem.InvalidFile.response(HttpStatus.BAD_REQUEST)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém uma evidência pelo seu identificador.
     *
     * @param id identificador da evidência.
     *
     * @return `200 OK` com a evidência, ou `404 Not Found` caso não exista.
     */
    @GetMapping("/{id}")
    fun findById(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = evidenceService.findById(id)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure ->
                when (result.value) {
                    is EvidenceError.EvidenceNotFound ->
                        Problem.EvidenceNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Permite o download do ficheiro associado a uma evidência.
     *
     * Define o header `Content-Disposition` para forçar download
     * com o nome original do ficheiro.
     *
     * @param id identificador da evidência.
     *
     * @return recurso binário do ficheiro ou erro apropriado.
     */
    @GetMapping("/{id}/download")
    fun downloadEvidence(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = evidenceService.downloadEvidence(id)
        return when (result) {
            is Success -> {
                val (evidence, resource) = result.value

                val filename = evidence.filePath.substringAfterLast("/")
                val path = Paths.get(evidence.filePath)
                val contentType = resolveContentType(path)

                ResponseEntity.ok()
                    .header(
                        "Content-Disposition",
                        "attachment; filename=\"$filename\"",
                    )
                    .contentType(contentType)
                    .body(resource)
            }

            is Failure ->
                when (result.value) {
                    is EvidenceError.EvidenceNotFound ->
                        Problem.EvidenceNotFound.response(HttpStatus.NOT_FOUND)
                    is EvidenceError.FileNotFound ->
                        Problem.FileNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém todas as evidências associadas a uma ocorrência.
     *
     * @param occurrenceId identificador da ocorrência.
     *
     * @return lista de evidências associadas.
     */
    @GetMapping("/byOccurrence/{occurrenceId}")
    fun findByOccurrenceId(
        @PathVariable occurrenceId: Int,
    ): ResponseEntity<*> {
        val result = evidenceService.findByOccurrenceId(occurrenceId)
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result)
    }

    /**
     * Obtém todas as evidências reportadas por um utilizador.
     *
     * @param reporterId identificador do utilizador.
     *
     * @return lista de evidências associadas ao utilizador.
     */
    @GetMapping("/byReporter/{reporterId}")
    fun findByReporterId(
        @PathVariable reporterId: Int,
    ): ResponseEntity<*> {
        val result = evidenceService.findByReporterId(reporterId)
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result)
    }

    /**
     * Obtém todas as evidências de um determinado tipo.
     *
     * O tipo é fornecido no corpo do pedido em formato JSON.
     *
     * @param type tipo da evidência.
     *
     * @return lista de evidências correspondentes ao tipo indicado.
     */
    @GetMapping("/byType")
    fun findByType(
        @RequestBody type: String,
    ): ResponseEntity<*> {
        val result = evidenceService.findByType(type)
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result)
    }

    /**
     * Obtém todas as evidências associadas a uma localização.
     *
     * @param location localização a filtrar.
     *
     * @return lista de evidências associadas à localização indicada.
     */
    @GetMapping("/byLocation/{location}")
    fun findByLocation(
        @PathVariable location: String,
    ): ResponseEntity<*> {
        val result = evidenceService.findByLocation(location)
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result)
    }

    /**
     * Obtém todas as evidências registadas no sistema.
     *
     * @return lista completa de evidências.
     */
    @GetMapping
    fun findAll(): ResponseEntity<*> {
        val result = evidenceService.findAll()
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result)
    }

    /**
     * Remove uma evidência do sistema.
     *
     * Em caso de sucesso, devolve `204 No Content`.
     *
     * @param id identificador da evidência.
     *
     * @return resposta HTTP correspondente ao resultado da operação.
     */
    @DeleteMapping("/{id}")
    fun deleteEvidence(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = evidenceService.deleteById(id)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.NO_CONTENT)
                    .build<Unit>()

            is Failure ->
                when (result.value) {
                    is EvidenceError.EvidenceNotFound ->
                        Problem.EvidenceNotFound.response(HttpStatus.NOT_FOUND)
                    is EvidenceError.OccurrenceNotFound ->
                        Problem.OccurrenceNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Fornece um endpoint SSE para escuta de atualizações de uma evidência.
     *
     * Permite ao cliente subscrever eventos em tempo real relacionados com
     * alterações numa evidência específica.
     *
     * Endpoint: GET /{evidenceId}/listen
     *
     * @param evidenceId identificador da evidência a observar.
     *
     * @return [SseEmitter] com ligação persistente para envio de eventos.
     */
    @GetMapping("/{evidenceId}/listen")
    fun listen(
        @PathVariable evidenceId: Int,
    ): SseEmitter {
        val sseEmitter = SseEmitter(Long.MAX_VALUE)
        publisher.evidencePublisher.addEmitter(
            evidenceId,
            SSEUpdatedDataAdapter(
                sseEmitter,
            ),
        )
        return sseEmitter
    }
}
