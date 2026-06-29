import { useEffect, useRef } from "react";
import { Occurrence } from "@commons/models/occurrence/Occurrence";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";

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
 * Hook que subscreve atualizações da lista de ocorrências do utilizador em tempo real via SSE (React Native).
 * Usa react-native-sse para abrir uma ligação ao endpoint `/api/occurrence/listen/user/{userID}`.
 * A ligação é gerida com debounce e encerrada automaticamente ao desmontar ou mudar deps.
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
  const esRef = useRef<EventSource | null>(null);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userID || enabled !== true) {
      return;
    }

    if (esRef.current) {
      try {
        esRef.current.removeAllEventListeners();
        esRef.current.close();
      } catch (e) {
        console.warn("Error closing previous SSE", e);
      }

      esRef.current = null;
    }

    const es = new EventSource(
      `${API_URL}/api/occurrence/listen/user/${userID}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        }
    );
    esRef.current = es;
    const onEvent = (event: any) => {
      try {
        const receivedMessage = JSON.parse(event.data);
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

    es.addEventListener("message", onEvent);
    es.addEventListener("error", (event) => {
      console.error("SSE Error:", event);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      try {
        es.removeAllEventListeners();
        es.close();
      } catch (e) {
        console.warn("Error closing EventSource:", e);
      }
      esRef.current = null;
    });

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      try {
        es.removeAllEventListeners();
        es.close();
      } catch (e) {
        console.warn("Error closing EventSource:", e);
      }
      esRef.current = null;
    };
  }, [userID, enabled, debounceMs]);
}
