package pt.ira

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import pt.ira.publishers.Publishers

@RestController
@RequestMapping("/api/listen")
class SSEController (
    private val publisher: Publishers,
) {
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