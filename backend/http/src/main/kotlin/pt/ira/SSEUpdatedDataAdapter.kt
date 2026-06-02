package pt.ira

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import pt.ira.emitters.UpdatedData
import pt.ira.emitters.UpdatedDataEmitter

/**
 * Adaptador que implementa a *interface* [UpdatedDataEmitter] utilizando SSE do Spring.
 *
 * Esta classe atua como uma ponte entre a abstração interna de emissão de dados ([UpdatedDataEmitter])
 * e a infraestrutura concreta do SSE providenciada pelo *framework* Spring. Encapsula a lógica
 * de transformação de sinais de atualização em eventos Server-Sent Events, permitindo comunicação
 * em tempo real bidirecional com os clientes conectados.
 *
 * @property sseEmitter Instância do SSE do Spring responsável pelo envio de eventos ao cliente.
 *
 * @constructor Cria uma instância de [SSEUpdatedDataAdapter] com um SSE específico.
 *
 * @see UpdatedDataEmitter
 * @see UpdatedData
 */

class SSEUpdatedDataAdapter(
    private val sseEmitter: SseEmitter,
) : UpdatedDataEmitter {
    /**
     * Emite um sinal de atualização ao cliente através do SSE.
     *
     * Converte o sinal genérico em evento SSE, distinguindo entre mensagens
     * contendo dados e eventos de keep-alive destinados a manter a conexão viva.
     *
     * @param signal Sinal de atualização a ser transmitido ([UpdatedData.Message] ou [UpdatedData.KeepAlive]).
     */
    override fun emit(signal: UpdatedData) {
        val msg =
            when (signal) {
                is UpdatedData.Message ->
                    SseEmitter
                        .event()
                        .id(signal.id.toString())
                        .name("message")
                        .data(signal)

                is UpdatedData.KeepAlive -> SseEmitter.event().comment(signal.toString())
            }
        sseEmitter.send(msg)
    }

    /**
     * Regista um callback a ser invocado quando a conexão SSE é completada.
     *
     * @param callback Função a ser executada aquando da conclusão da conexão.
     */
    override fun onCompletion(callback: () -> Unit) {
        sseEmitter.onCompletion(callback)
    }

    /**
     * Regista um callback a ser invocado quando ocorre um erro na conexão SSE.
     *
     * @param callback Função a ser executada com o erro que ocorreu.
     */
    override fun onError(callback: (Throwable) -> Unit) {
        sseEmitter.onError(callback)
    }
}
