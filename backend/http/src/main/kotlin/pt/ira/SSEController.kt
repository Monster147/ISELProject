package pt.ira

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import pt.ira.publishers.Publishers

@RestController
@RequestMapping("/api/listen")
class SSEController(
    private val publisher: Publishers,
) {
    /**
     * Estabelece uma ligação SSE agregada para um utilizador específico.
     *
     * Esta subscrição permite ao cliente receber eventos em tempo real relacionados com:
     * - ocorrências do utilizador;
     * - intervenientes;
     * - evidências associadas;
     * - documentos do sistema;
     * - tipos de ocorrência.
     *
     * Após a ligação ser estabelecida, o cliente recebe atualizações sempre que
     * ocorrerem alterações nos recursos subscritos, sem necessidade de requisições
     * adicionais (polling).
     *
     * A ligação permanece ativa até ser explicitamente encerrada pelo cliente
     * ou pelo servidor.
     *
     * @param userId identificador do utilizador que irá receber os eventos.
     *
     * @return [SseEmitter] ligação persistente SSE utilizada para envio de eventos em tempo real.
     */
    @GetMapping("/user/{userId}")
    fun listenAll(
        @PathVariable userId: Int,
    ): SseEmitter {
        val sseEmitter = SseEmitter(Long.MAX_VALUE)
        val adapter = SSEUpdatedDataAdapter(sseEmitter)

        publisher.occurrencesPublisher.addEmitter(userId, adapter)
        publisher.intervenorsPublisher.addEmitter(adapter)
        publisher.evidencePublisher.addEmitter(userId, adapter)
        publisher.documentsPublisher.addEmitter(adapter)
        publisher.typesPublisher.addEmitter(adapter)

        return sseEmitter
    }
}
