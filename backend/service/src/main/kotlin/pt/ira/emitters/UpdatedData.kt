package pt.ira.emitters

import java.time.Instant

/**
 * Representa um sinal de dados atualizado enviado pelo emissor.
 *
 */
sealed interface UpdatedData {
    /**
     * Mensagem que transporta os dados do evento e o tipo de ação.
     * @property id identificador único da mensagem (por ordem ou sequência).
     * @property data payload da mensagem — pode ser qualquer objeto serializável.
     * @property action tipo de ação que descreve o evento.
     */
    data class Message(
        val id: Long,
        val data: Any,
        val action: ActionKind,
    ) : UpdatedData

    /**
     * Sinal de keep-alive para manter ligações abertas e sinalizar atividade.
     *
     * @property timestamp instante em que o keep-alive foi gerado.
     * @property count contador incremental por instância.
     */
    data class KeepAlive(
        val timestamp: Instant,
    ) : UpdatedData {
        companion object {
            /**
             * Contador global usado para atribuir um número sequencial às instâncias.
             */
            var count = 1
        }

        /**
         * Contador atribuído a esta instância (cópia do contador global no momento da criação).
         */
        val count: Int = Companion.count++

        override fun toString() = "${timestamp.epochSecond} - $count"
    }
}

/**
 * Tipos de ação associados a uma `Message`.
 *
 * Cada constante contém uma mensagem.
 *
 * @property message descrição da ação.
 */
enum class ActionKind(val message: String) {
    EvidenceCreated("Evidence created"),
    EvidenceDeleted("Evidence deleted"),
    IntervenorCreated("Intervenor created"),
    IntervenorUpdated("Intervenor updated"),
    IntervenorDeleted("Intervenor deleted"),
    IntervenorsChanged("Intervenors changed"),
    OccurrenceCreated("Occurrence created"),
    OccurrenceDeleted("Occurrence deleted"),
    IntervenorAdded("Intervenor added"),
    IntervenorRemoved("Intervenor removed"),
    OccurrencesChanged("Occurrences changed"),
    ReportCreated("Report created"),
    ReportDeleted("Report deleted"),
    ReportStatusChanged("Report status changed"),
    EditorAdded("Editor added"),
    EditorRemoved("Editor removed"),
}
