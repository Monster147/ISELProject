import { useEffect, useRef } from "react";
import { Documents } from "@commons/models/documents/Documents";
import {getAPIUrl} from "@utils/getAPIUrl";

export type DocumentsUpdateAction = "DocumentsChanged";

export interface DocumentsUpdateData {
  documents: Documents[];
  action: DocumentsUpdateAction;
}

export interface SSEMessage {
  id?: number;
  data: DocumentsUpdateData;
  action: DocumentsUpdateAction;
}

/**
 * Hook que subscreve atualizações de documentos em tempo real via SSE.
 * Abre uma ligação ao endpoint `/api/documents/listen` e invoca `onMessage`
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
export function useDocumentsListener(
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
    const eventSource = new EventSource(`${getAPIUrl()}/documents/listen`);

    eventSource.onmessage = (occurrence) => {
      try {
        const receivedMessage = JSON.parse(occurrence.data);
        const value = receivedMessage?.data;
        const documents: Documents[] = Array.isArray(value) ? value : [];
        const message: SSEMessage = {
          id: receivedMessage.id,
          action: receivedMessage.action,
          data: {
            action: receivedMessage.action,
            documents,
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
  }, [enabled, debounceMs, userId]);
}
