package pt.ira

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import pt.ira.emitters.UpdatedData
import pt.ira.emitters.UpdatedDataEmitter

class SSEUpdatedDataAdapter(
    private val sseEmitter: SseEmitter,
) : UpdatedDataEmitter {
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

    override fun onCompletion(callback: () -> Unit) {
        sseEmitter.onCompletion(callback)
    }

    override fun onError(callback: (Throwable) -> Unit) {
        sseEmitter.onError(callback)
    }
}
