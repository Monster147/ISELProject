import { Occurrence } from "@commons/models/occurrence/Occurrence";
import { useEffect, useRef } from "react";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";

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
 * Hook que subscreve atualizações de uma ocorrência específica em tempo real via SSE (React Native).
 * Usa react-native-sse para abrir uma ligação ao endpoint `/api/occurrence/{occurrenceId}/listen`.
 * A ligação é gerida com debounce e encerrada automaticamente ao desmontar ou mudar deps.
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
  const esRef = useRef<EventSource | null>(null);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!occurrenceId || enabled !== true || !userId) {
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
      `${API_URL}/api/occurrence/${Number(occurrenceId)}/listen`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        }
    );

    esRef.current = es;
    const listener = (event: any) => {
      try {
        const message: SSEMessage = JSON.parse(event.data);
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

    es.addEventListener("message", listener);

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
  }, [occurrenceId, enabled, debounceMs, userId]);
}
