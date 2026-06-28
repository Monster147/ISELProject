import { useEffect, useRef } from "react";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";

export type SSEMessage =
  | { action: "IntervenorsChanged"; data: any }
  | { action: "EvidenceChanged"; data: any }
  | { action: "DocumentsChanged"; data: any }
  | { action: "OccurrencesChanged"; data: any }
  | { action: "TypesChanged"; data: any };

/**
 * Hook que subscreve todos os tipos de eventos SSE do utilizador num único endpoint (React Native).
 * Usa react-native-sse para abrir uma ligação ao endpoint `/api/listen/user/{userId}`,
 * que agrega eventos de todos os domínios (ocorrências, intervenientes, evidências, documentos, tipos).
 * Cada tipo de ação tem o seu próprio debounce independente.
 * A ligação é encerrada automaticamente ao desmontar ou mudar deps.
 * A ligação só é estabelecida se `enabled` for true e `userId` estiver definido, garantindo que apenas
 * utilizadores autenticados e com conexão à internet recebem eventos.
 *
 * @param userId Identificador do utilizador (a subscrição só ativa com userId definido).
 * @param onMessage Callback invocado com a mensagem SSE recebida. O debounce garante que,
 *                  caso o servidor emita múltiplos eventos do mesmo tipo em rápida sucessão,
 *                  o callback só é invocado uma vez após o intervalo definido ter passado
 *                  sem novos eventos desse tipo, evitando re-renders ou chamadas à API desnecessárias.
 * @param enabled Controla se a ligação SSE deve estar ativa (true para ativar).
 * @param debounceMs Intervalo de debounce em milissegundos por tipo de ação. Por omissão: 1000.
 */
export function useListenAllListener(
  userId: number | undefined,
  onMessage: (message: SSEMessage) => void,
  enabled: boolean | null,
  debounceMs: number = 1000,
) {
  const onMessageRef = useRef(onMessage);
  const esRef = useRef<EventSource | null>(null);
  const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (enabled !== true || !userId) {
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

    const es = new EventSource(`${API_URL}/api/listen/user/${userId}`);

    esRef.current = es;
    const onEvent = (event: any) => {
      try {
        const receivedMessage = JSON.parse(event.data);
        const action = receivedMessage.action;

        if (debounceRefs.current[action]) {
          clearTimeout(debounceRefs.current[action]);
        }

        debounceRefs.current[action] = setTimeout(() => {
          onMessageRef.current(receivedMessage);
        }, debounceMs);
      } catch (e) {
        console.error("[SSE All] parse error", e);
      }
    };

    es.addEventListener("message", onEvent);

    es.addEventListener("error", (event) => {
      console.error("SSE Error:", event);
      for (const key in debounceRefs.current) {
        const t = debounceRefs.current[key];
        if (t) clearTimeout(t);
      }
      debounceRefs.current = {};
      try {
        es.removeAllEventListeners();
        es.close();
      } catch (e) {
        console.warn("Error closing EventSource:", e);
      }
      esRef.current = null;
    });

    return () => {
      for (const key in debounceRefs.current) {
        const t = debounceRefs.current[key];
        if (t) clearTimeout(t);
      }
      debounceRefs.current = {};
      try {
        es.removeAllEventListeners();
        es.close();
      } catch (e) {
        console.warn("Error closing EventSource:", e);
      }
      esRef.current = null;
    };
  }, [userId, enabled, debounceMs]);
}
