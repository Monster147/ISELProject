import { Intervenor } from "@commons/models/intervenor/Intervenor";
import { useEffect, useRef, useState } from "react";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";
import { AppState } from "react-native";

export type IntervenorsUpdateAction = "IntervenorsChanged";

export interface IntervenorsUpdateData {
  intervenors: Intervenor[];
  action: IntervenorsUpdateAction;
}

export interface SSEMessage {
  id?: number;
  data: IntervenorsUpdateData;
  action: IntervenorsUpdateAction;
}

/**
 * Hook que subscreve atualizações da lista de intervenientes em tempo real via SSE (React Native).
 * Usa react-native-sse para abrir uma ligação ao endpoint `/api/intervenor/listen`.
 * A ligação é gerida com debounce e encerrada automaticamente ao desmontar ou mudar deps.
 * A ligação só é estabelecida se `enabled` for true e `userId` estiver definido, garantindo que apenas
 * utilizadores autenticados e com conexão à internet recebem eventos.
 * A ligação é restabelecida quando a aplicação retorna do background (inactive) para o foreground (active).
 *
 * @param userId Identificador do utilizador (a subscrição só ativa com userId definido).
 * @param onMessage Callback invocado com a mensagem SSE recebida. O debounce garante que,
 *                  caso o servidor emita múltiplos eventos em rápida sucessão, o callback
 *                  só é invocado uma vez após o intervalo definido ter passado sem novos eventos,
 *                  evitando re-renders ou chamadas à API desnecessárias.
 * @param enabled Controla se a ligação SSE deve estar ativa (true para ativar).
 * @param debounceMs Intervalo de debounce em milissegundos. Por omissão: 1000.
 */
export function useIntervenorsListener(
  userId: number | undefined,
  onMessage: (message: SSEMessage) => void,
  enabled: boolean | null,
  debounceMs: number = 1000,
) {
  const onMessageRef = useRef(onMessage);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const [reconnectTick, setReconnectTick] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !esRef.current) {
        setReconnectTick((prev) => prev + 1);
      }
    });
    return () => sub.remove();
  }, []);

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

    const es = new EventSource(`${API_URL}/api/intervenor/listen`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    esRef.current = es;
    const onEvent = (event: any) => {
      try {
        const receivedMessage = JSON.parse(event.data);
        const value = receivedMessage?.data;
        const intervenors: Intervenor[] = Array.isArray(value) ? value : [];

        const message: SSEMessage = {
          id: receivedMessage.id,
          action: receivedMessage.action,
          data: {
            action: receivedMessage.action,
            intervenors,
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
  }, [enabled, debounceMs, userId, reconnectTick]);
}
