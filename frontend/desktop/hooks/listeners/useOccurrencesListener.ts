import { useEffect, useRef } from "react";
import { Occurrence } from "@commons/models/occurrence/Occurrence";
import {getAPIUrl} from "@utils/getAPIUrl";

export type OccurrencesUpdateAction = "OccurrencesChanged";

export interface OccurrenceUpdateData {
  occurrences: Occurrence[];
  action: OccurrencesUpdateAction;
}

export interface SSEMessage {
  id?: number;
  data: OccurrenceUpdateData;
  action: OccurrencesUpdateAction;
}

/**
 * Hook que subscreve atualizações da lista de ocorrências do utilizador em tempo real via SSE.
 * Abre uma ligação ao endpoint `/api/occurrence/listen/user/{userId}` e invoca `onMessage`
 * com debounce sempre que o servidor emite um evento.
 * A ligação é encerrada automaticamente quando o componente desmonta ou os deps mudam.
 * A ligação só é estabelecida se `enabled` for true e `userId` estiver definido, garantindo que apenas
 * utilizadores autenticados e com conexão à internet recebem eventos.
 *
 * @param userID Identificador do utilizador (subscreve apenas as suas ocorrências).
 * @param onMessage Callback invocado com a mensagem SSE recebida. O debounce garante que,
 *                  caso o servidor emita múltiplos eventos em rápida sucessão, o callback
 *                  só é invocado uma vez após o intervalo definido ter passado sem novos eventos,
 *                  evitando re-renders ou chamadas à API desnecessárias.
 * @param enabled Controla se a ligação SSE deve estar ativa (true para ativar).
 * @param debounceMs Intervalo de debounce em milissegundos. Por omissão: 1000.
 */
export function useOccurrencesListener(
  userID: number | undefined,
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
    if (!userID || enabled !== true) return;

    const eventSource = new EventSource(
      `${getAPIUrl()}/occurrence/listen/user/${userID}`,
    );

    eventSource.onmessage = (occurrence) => {
      try {
        const receivedMessage = JSON.parse(occurrence.data);
        const value = receivedMessage?.data;
        const occurrences: Occurrence[] = Array.isArray(value) ? value : [];
        const message: SSEMessage = {
          id: receivedMessage.id,
          action: receivedMessage.action,
          data: {
            action: receivedMessage.action,
            occurrences,
          },
        };

        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          onMessageRef.current(message);
        }, debounceMs);
      } catch (error) {
        console.error("Error parsing SSE message:", error);
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
  }, [userID, enabled, debounceMs]);
}
