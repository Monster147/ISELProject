import { Intervenor } from "@commons/models/intervenor/Intervenor";
import { useEffect, useRef } from "react";

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
 * Hook que subscreve atualizações da lista de intervenientes em tempo real via SSE.
 * Abre uma ligação ao endpoint `/api/intervenor/listen` e invoca `onMessage`
 * com debounce sempre que o servidor emite um evento.
 * A ligação é encerrada automaticamente quando o componente desmonta ou os deps mudam.
 * A ligação só é estabelecida se `enabled` for true e `userId` estiver definido, garantindo que apenas
 * utilizadores autenticados e com conexão à internet recebem eventos.
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

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (enabled !== true || !userId) return;
    const eventSource = new EventSource(`/api/intervenor/listen`);

    eventSource.onmessage = (intervenor) => {
      try {
        const receivedMessage = JSON.parse(intervenor.data);
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

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [enabled, debounceMs, userId]);
}
