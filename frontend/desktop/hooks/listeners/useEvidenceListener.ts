import { useEffect, useRef } from "react";
import { Evidence } from "@commons/models/evidence/Evidence";
import {getAPIUrl} from "@utils/getAPIUrl";

export type EvidenceUpdateAction = "EvidenceChanged";

export interface EvidenceUpdateData {
  evidences: Evidence[];
  action: EvidenceUpdateAction;
}

export interface SSEMessage {
  id?: number;
  data: EvidenceUpdateData;
  action: EvidenceUpdateAction;
}

/**
 * Hook que subscreve atualizações de evidências em tempo real via SSE.
 * Abre uma ligação ao endpoint `/api/evidence/{userId}/listen` e invoca `onMessage`
 * com debounce sempre que o servidor emite um evento.
 * A ligação é encerrada automaticamente quando o componente desmonta ou os deps mudam.
 * A ligação só é estabelecida se `enabled` for true e `userId` estiver definido, garantindo que apenas
 * utilizadores autenticados e com conexão à internet recebem eventos.
 *
 * @param userId Identificador do utilizador (subscreve apenas as suas evidências).
 * @param onMessage Callback invocado com a mensagem SSE recebida. O debounce garante que,
 *                  caso o servidor emita múltiplos eventos em rápida sucessão, o callback
 *                  só é invocado uma vez após o intervalo definido ter passado sem novos eventos,
 *                  evitando re-renders ou chamadas à API desnecessárias.
 * @param enabled Controla se a ligação SSE deve estar ativa (true para ativar).
 * @param debounceMs Intervalo de debounce em milissegundos. Por omissão: 1000.
 */
export function useEvidenceListener(
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
    if (!userId || enabled !== true) return;

    const eventSource = new EventSource(
      `${getAPIUrl()}/evidence/${Number(userId)}/listen`,
    );

    eventSource.onmessage = (evidence) => {
      try {
        const receivedMessage = JSON.parse(evidence.data);
        const value = receivedMessage?.data;
        const evidences: Evidence[] = Array.isArray(value) ? value : [];

        const message: SSEMessage = {
          id: receivedMessage.id,
          action: receivedMessage.action,
          data: {
            action: receivedMessage.action,
            evidences,
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
  }, [userId, enabled, debounceMs]);
}
