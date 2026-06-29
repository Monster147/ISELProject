import { Occurrence } from "@commons/models/occurrence/Occurrence";
import { useEffect, useRef } from "react";
import {getAPIUrl} from "@utils/getAPIUrl";

export type OccurrenceUpdateAction =
  | "EvidenceChanged"
  | "OccurrenceCreated"
  | "OccurrenceDeleted"
  | "IntervenorAdded"
  | "IntervenorRemoved";

export interface OccurrenceUpdateData {
  occurrence?: Occurrence;
  action: OccurrenceUpdateAction;
}

export interface SSEMessage {
  id?: number;
  data: OccurrenceUpdateData;
  action: OccurrenceUpdateAction;
}

/**
 * Hook que subscreve atualizações de uma ocorrência específica em tempo real via SSE.
 * Abre uma ligação ao endpoint `/api/occurrence/{occurrenceId}/listen` e invoca `onMessage`
 * com debounce sempre que o servidor emite um evento (ex: evidência adicionada, interveniente alterado).
 * A ligação é encerrada automaticamente quando o componente desmonta ou os deps mudam.
 * A ligação só é estabelecida se `enabled` for true, `userId` e `occurrenceId` estiverem definidos, garantindo que apenas
 * utilizadores autenticados, com conexão à internet e com uma ocorrência válida recebem eventos.
 *
 * @param userId Identificador do utilizador autenticado.
 * @param occurrenceId Identificador da ocorrência a observar.
 * @param onMessage Callback invocado com a mensagem SSE recebida. O debounce garante que,
 *                  caso o servidor emita múltiplos eventos em rápida sucessão, o callback
 *                  só é invocado uma vez após o intervalo definido ter passado sem novos eventos,
 *                  evitando re-renders ou chamadas à API desnecessárias.
 * @param enabled Controla se a ligação SSE deve estar ativa (true para ativar).
 * @param debounceMs Intervalo de debounce em milissegundos. Por omissão: 1000.
 */
export function useOccurrenceListener(
  userId: number | undefined,
  occurrenceId: string | undefined,
  onMessage: (message: SSEMessage) => void,
  enabled: boolean | null,
  debounceMs: number = 1000,
) {
  const onMessageRef = useRef(onMessage);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId || !occurrenceId || enabled !== true) return;

    const eventSource = new EventSource(
      `${getAPIUrl()}/occurrence/${Number(occurrenceId)}/listen`,
    );

    eventSource.onmessage = (occurrence) => {
      try {
        const message: SSEMessage = JSON.parse(occurrence.data);
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          onMessageRef.current(message);
        }, debounceMs);
      } catch (error) {
        console.error("Failed to parse SSE message", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      eventSource.close();
    };

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      eventSource.close();
    };
  }, [occurrenceId, enabled, debounceMs, userId]);
}
