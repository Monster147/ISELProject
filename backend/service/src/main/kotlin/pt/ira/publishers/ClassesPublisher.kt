package pt.ira.publishers

import jakarta.annotation.PreDestroy
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
 * Publicador de actualizações de uma lista de class (Intervenor, Evidence, Occurrence ou Report).
 *
 * Mantém uma lista de emissores `UpdatedDataEmitter` e envia sinais de
 * `Message` e `KeepAlive` para todos os listeners registados.
 *
 * É responsável por:
 * - registar e remover emissores (`UpdatedDataEmitter`),
 * - enviar mensagens de evento a todos os listeners,
 * - enviar sinais periódicos de keep-alive,
 * - encerrar o scheduler em `destroy()`.
 *
 * A classe usa um `ReentrantLock` para proteger operações concorrentes sobre a
 * lista de listeners. O campo `currentId` gera identificadores sequenciais para
 * as mensagens enviadas.
 */
class ClassesPublisher {
    /**
     * Lista mutável de emissores registados.
     */
    private val listeners = mutableListOf<UpdatedDataEmitter>()

    /**
     * Identificador sequencial usado nas mensagens enviadas.
     */
    private var currentId = 0L

    /**
     * Lock que protege as operações que alteram `listeners`.
     */
    private val lock = ReentrantLock()

    companion object {
        private val logger = LoggerFactory.getLogger(ClassesPublisher::class.java)
    }

    /**
     * Scheduler que dispara `keepAlive()` periodicamente.
     *
     * Configurado para executar a cada 2 segundos.
     */
    private val executor =
        Executors
            .newScheduledThreadPool(1)
            .also {
                it.scheduleAtFixedRate({ keepAlive() }, 2, 2, TimeUnit.SECONDS)
            }

    /**
     * Envia uma `Message` para todos os emissores registados.
     *
     * O `id` da mensagem é gerado incrementando `currentId`.
     * Excepções lançadas pelos emissores são capturadas e registadas.
     *
     * @param data conteúdo da mensagem (payload).
     * @param action tipo de acção associado à mensagem.
     */
    fun sendMessageToAll(
        data: Any,
        action: ActionKind,
    ) {
        lock.withLock {
            listeners.forEach {
                try {
                    it.emit(
                        UpdatedData.Message(
                            ++currentId,
                            data,
                            action,
                        ),
                    )
                } catch (ex: Exception) {
                    logger.info("Exception while sending Message signal - {}", ex.message)
                }
            }
        }
    }

    /**
     * Adiciona um emissor à lista e regista callbacks para remoção automática
     * quando o emissor completar ou reportar erro.
     *
     * A operação é atómica e protegida por `lock`.
     *
     * @param listener emissor a adicionar.
     * @return o `listener` adicionado (útil para encadeamento).
     */
    fun addEmitter(listener: UpdatedDataEmitter) =
        lock.withLock {
            logger.info("adding listener")

            listeners.add(listener)
            listener.onCompletion {
                logger.info("onCompletion")
                removeEmitter(listener)
            }
            listener.onError {
                logger.info("onError")
                removeEmitter(listener)
            }
            listener
        }

    /**
     * Remove um emissor da lista de listeners.
     *
     * Protegido por `lock`. Lança excepción se a lista for nula (invariante).
     *
     * @param listener emissor a remover.
     */
    private fun removeEmitter(listener: UpdatedDataEmitter) =
        lock.withLock {
            logger.info("removing listener")
            val oldListeners = listeners
            requireNotNull(oldListeners)
            listeners.remove(listener)
        }

    /**
     * Envia um sinal de `KeepAlive` para todos os emissores registados.
     *
     * Chamado periodicamente pelo scheduler; captura e regista excepções lançadas pelos emissores.
     */
    private fun keepAlive() =
        lock.withLock {
            val signal = UpdatedData.KeepAlive(Instant.now())
            listeners.forEach {
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
     * Marcado com `@PreDestroy` para ser invocado pelo contentor quando a
     * aplicação estiver a terminar.
     */
    @PreDestroy
    fun destroy() {
        logger.info("Stopping scheduler!!!!")
        executor.shutdown()
    }
}
