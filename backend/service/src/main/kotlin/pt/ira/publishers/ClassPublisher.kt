package pt.ira.publishers

import jakarta.annotation.PreDestroy
import jakarta.inject.Named
import org.slf4j.LoggerFactory
import pt.ira.emitters.ActionKind
import pt.ira.emitters.UpdatedData
import pt.ira.emitters.UpdatedDataEmitter
import java.time.Instant
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.withLock

/**
 * Publicador de atualizações de uma classe (Intervenor, Evidence, Occurrence ou Report).
 *
 * Mantém um mapa de listeners por class e envia sinais de
 * `Message` e `KeepAlive` para todos os listeners registados.
 *
 * É responsável por:
 * - registar/remover emissores (`UpdatedDataEmitter`),
 * - emitir mensagens a todos os emissores de uma class,
 * - enviar sinais periódicos de keep-alive por meio de um *scheduled executor*,
 * - encerrar o scheduler em `destroy()`.
 *
 * Esta classe usa um `ReentrantLock` para proteger operações que alteram o mapa de
 * listeners. O `currentId` é incrementado para gerar um identificador sequencial
 * das mensagens enviadas.
 */
@Named
class ClassPublisher {
    private val listeners = mutableMapOf<Int, List<UpdatedDataEmitter>>()
    private var currentId = 0L
    private val lock = ReentrantLock()

    companion object {
        private val logger = LoggerFactory.getLogger(ClassPublisher::class.java)
    }

    private val executor =
        Executors
            .newScheduledThreadPool(1)
            .also {
                it.scheduleAtFixedRate({ keepAlive() }, 0, 15, TimeUnit.SECONDS)
            }

    /**
     * Envia uma `Message` para todos os emissores registados do `id`.
     *
     * O `id` da mensagem é obtido incrementando `currentId`.
     * Exceções lançadas pelos emissores são capturadas e registadas.
     *
     * @param id identificador da classe cujos listeners devem receber a mensagem.
     * @param data conteúdo da mensagem.
     * @param action tipo de ação associado à mensagem.
     */
    fun sendMessageToAll(
        id: Int,
        data: Any,
        action: ActionKind,
    ) {
        val messageId: Long
        val currentListeners: List<UpdatedDataEmitter>

        lock.withLock {
            messageId = ++currentId
            currentListeners = listeners[id]?.toList() ?: emptyList()
        }

        currentListeners.forEach {
            try {
                it.emit(
                    UpdatedData.Message(
                        messageId,
                        data,
                        action,
                    ),
                )
            } catch (ex: Exception) {
                logger.info("Exception while sending Message signal - {}", ex.message)
            }
        }
    }

    /**
     * Adiciona um emissor ao `id` e regista callbacks para remoção automática
     * em caso de conclusão ou erro do emissor.
     *
     * Esta operação é protegida por lock.
     *
     * @param id identificador da classe onde registar o emissor.
     * @param listener emissor a adicionar.
     * @return o `listener` adicionado.
     */
    fun addEmitter(
        id: Int,
        listener: UpdatedDataEmitter,
    ) = lock.withLock {
        logger.info("adding listener")
        val oldListeners = listeners.getOrDefault(id, emptyList())
        listeners[id] = oldListeners + listener
        listener.onCompletion {
            logger.info("onCompletion")
            removeEmitter(id, listener)
        }
        listener.onError {
            logger.info("onError")
            removeEmitter(id, listener)
        }
        listener
    }

    /**
     * Remove um emissor do `id`.
     *
     * Lança `IllegalArgumentException` se não existirem listeners para o `id`.
     *
     * @param id identificador da classe.
     * @param listener emissor a remover.
     * @throws IllegalArgumentException se não existirem listeners registados para o `id`.
     */
    private fun removeEmitter(
        id: Int,
        listener: UpdatedDataEmitter,
    ) = lock.withLock {
        logger.info("removing listener")
        val oldListeners = listeners[id]
        requireNotNull(oldListeners)
        listeners.replace(id, oldListeners - listener)
    }

    /**
     * Envia periodicamente um sinal de `KeepAlive` para todos os emissores.
     *
     * Chamado pelo scheduler; captura e regista exceções lançadas pelos emissores.
     */
    private fun keepAlive() {
        val currentListeners = lock.withLock {
            listeners.values.flatten().toList()
        }

        val signal = UpdatedData.KeepAlive(Instant.now())

        currentListeners.forEach {
            try {
                it.emit(signal)
            } catch (ex: Exception) {
                logger.info("Exception while sending keepAlive signal - {}", ex.message)
            }
        }
    }

    /**
     * Encerra o scheduler que envia sinais de keep-alive.
     *
     * Marcado com `@PreDestroy` para ser invocado pelo contentor, quando a aplicação
     * estiver a terminar.
     */
    @PreDestroy
    fun destroy() {
        logger.info("Stopping scheduler!!!!")
        executor.shutdown()
    }
}
