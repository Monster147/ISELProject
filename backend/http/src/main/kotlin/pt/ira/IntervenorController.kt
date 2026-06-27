package pt.ira

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import pt.ira.intervenor.Intervenor
import pt.ira.model.Problem
import pt.ira.model.intervenor.IntervenorInput
import pt.ira.model.intervenor.IntervenorUpdateInput
import pt.ira.publishers.Publishers

/**
 * Controlador REST responsável pela gestão de intervenientes (intervenors).
 *
 * Expõe endpoints HTTP para criação, consulta, atualização e eliminação de intervenientes,
 * bem como mecanismos de subscrição a eventos em tempo real através de Server-Sent Events (SSE).
 *
 * Atua como camada de adaptação entre o protocolo HTTP e a lógica de domínio,
 * delegando toda a lógica de negócio no [IntervenorService] e convertendo os
 * resultados em respostas HTTP normalizadas.
 *
 * Responsabilidades principais:
 * - criação e atualização de intervenientes;
 * - consulta por diferentes critérios (*id*, número de identificação, contacto);
 * - eliminação de intervenientes;
 * - exposição de streams SSE para notificações de alterações individuais e globais;
 * - mapeamento de erros de domínio para códigos de estado HTTP e modelos de erro.
 *
 * @param intervenorService serviço responsável pela lógica de negócio dos intervenientes.
 * @param publisher conjunto de publicadores utilizados para gerir subscrições SSE.
 */
@RestController
@RequestMapping("/api/intervenor")
class IntervenorController(
    private val intervenorService: IntervenorService,
    private val publisher: Publishers,
) {
    /**
     * Cria um interveniente no sistema.
     *
     * Em caso de sucesso, devolve `201 Created` e o header `Location`
     * com a localização do recurso criado.
     *
     * @param intervenorInput dados necessários para a criação do interveniente.
     *
     * @return resposta HTTP com o resultado da operação.
     */
    @PostMapping
    fun createIntervenor(
        @RequestBody intervenorInput: IntervenorInput,
    ): ResponseEntity<*> {
        val result: Either<IntervenorError, Intervenor> =
            intervenorService.createIntervenor(
                idNumber = intervenorInput.idNumber,
                idType = intervenorInput.idType,
                name = intervenorInput.name,
                contactInfo = intervenorInput.contactInfo,
                address = intervenorInput.address,
            )

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header(
                        "Location",
                        "/api/intervenor/${result.value.id}",
                    ).build<Unit>()

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Obtém todos os intervenientes registados no sistema.
     *
     * @return `200 OK` com a lista completa de intervenientes.
     */
    @GetMapping
    fun findAllIntervenors(): ResponseEntity<*> {
        val intervenors = intervenorService.findAll()
        return ResponseEntity.status(HttpStatus.OK).body(intervenors)
    }

    /**
     * Atualiza os dados de um interveniente existente.
     *
     * Em caso de sucesso, devolve `200 OK` com o interveniente atualizado
     * e o header `Location` a apontar para o recurso.
     *
     * @param intervenorUpdateInput dados de atualização.
     * @param intervenorId identificador do interveniente a atualizar.
     *
     * @return resposta HTTP com o resultado da operação.
     */
    @PutMapping("/update/{intervenorId}")
    fun updateIntervenor(
        @RequestBody intervenorUpdateInput: IntervenorUpdateInput,
        @PathVariable intervenorId: Int,
    ): ResponseEntity<*> {
        val result =
            intervenorService.updateIntervenor(
                intervenorId = intervenorId,
                idNumber = intervenorUpdateInput.idNumber,
                idType = intervenorUpdateInput.idType,
                name = intervenorUpdateInput.name,
                contactInfo = intervenorUpdateInput.contactInfo,
                address = intervenorUpdateInput.address,
            )

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .header(
                        "Location",
                        "/api/intervenor/${result.value.id}",
                    ).body(
                        result.value,
                    )

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Elimina um interveniente com base no número de identificação.
     *
     * Em caso de sucesso, devolve `204 No Content`.
     *
     * @param idNumber número de identificação do interveniente.
     *
     * @return resposta HTTP correspondente ao resultado da operação.
     */
    @DeleteMapping("/delete/byIdNumber/{idNumber}")
    fun deleteIntervenorByIdNumber(
        @PathVariable idNumber: String,
    ): ResponseEntity<*> {
        val result =
            intervenorService.deleteIntervenorByIdNumber(
                idNumber = idNumber,
            )

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.NO_CONTENT)
                    .build<Any>()

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Obtém um interveniente pelo seu número de identificação.
     *
     * @param idNumber número de identificação do interveniente.
     *
     * @return `200 OK` com o interveniente ou `404 Not Found` se não existir.
     */
    @GetMapping("/byIdNumber/{idNumber}")
    fun findIntervenorByIdNumber(
        @PathVariable idNumber: String,
    ): ResponseEntity<*> {
        val result =
            intervenorService.findByIntervenorByIdNumber(
                idNumber = idNumber,
            )

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Obtém intervenientes com base no contacto.
     *
     * @param contactInfo informação de contacto utilizada como filtro.
     *
     * @return lista de intervenientes correspondentes ou erro apropriado.
     */
    @GetMapping("/byContactInfo/{contactInfo}")
    fun findIntervenorByContactInfo(
        @PathVariable contactInfo: String,
    ): ResponseEntity<*> {
        val result =
            intervenorService.findByIntervenorContactInfo(
                contactInfo = contactInfo,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Obtém um interveniente pelo seu identificador interno.
     *
     * @param id identificador do interveniente.
     *
     * @return `200 OK` com o interveniente ou `404 Not Found` se não existir.
     */
    @GetMapping("/{id}")
    fun findIntervenorById(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = intervenorService.findByID(id)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure -> result.value.toResponse()
        }
    }

    /**
     * Fornece um endpoint SSE para subscrição de atualizações de um interveniente específico.
     *
     * Permite receber eventos em tempo real associados a alterações nesse interveniente.
     *
     * Endpoint: GET /{intervenorId}/listen
     *
     * @param intervenorId identificador do interveniente a observar.
     *
     * @return [SseEmitter] com ligação persistente para eventos.
     */
    @GetMapping("/{intervenorId}/listen")
    fun listen(
        @PathVariable intervenorId: Int,
    ): SseEmitter {
        val sseEmitter = SseEmitter(Long.MAX_VALUE)
        publisher.intervenorPublisher.addEmitter(
            intervenorId,
            SSEUpdatedDataAdapter(
                sseEmitter,
            ),
        )
        return sseEmitter
    }

    /**
     * Fornece um endpoint SSE para subscrição de alterações na lista global de intervenientes.
     *
     * Permite receber eventos em tempo real sempre que a lista de intervenientes é atualizada.
     *
     * Endpoint: GET /listen
     *
     * @return [SseEmitter] com ligação persistente para eventos globais.
     */
    @GetMapping("/listen")
    fun listenIntervenors(): SseEmitter {
        val sseEmitter = SseEmitter(Long.MAX_VALUE)
        publisher.intervenorsPublisher.addEmitter(
            SSEUpdatedDataAdapter(
                sseEmitter,
            ),
        )
        return sseEmitter
    }

    /**
     * Converte um erro de domínio [IntervenorError] na resposta HTTP correspondente.
     *
     * Mapeamento de erros:
     * - [IntervenorError.IntervenorNotFound] → 404 Not Found
     * - [IntervenorError.IntervenorAlreadyExists] → 400 Bad Request
     *
     * @receiver Erro de domínio a converter.
     * @return [ResponseEntity] com o [Problem] e o código HTTP adequados.
     */
    private fun IntervenorError.toResponse(): ResponseEntity<*> =
        when (this) {
            is IntervenorError.IntervenorNotFound -> Problem.IntervenorNotFound.response(HttpStatus.NOT_FOUND)
            is IntervenorError.IntervenorAlreadyExists -> Problem.IntervenorAlreadyExists.response(HttpStatus.BAD_REQUEST)
            else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
        }
}
