import { useEffect, useRef } from "react";
import { Type } from "@commons/models/type/Type";

export type TypesUpdateAction = "TypesChanged";

export interface TypesUpdateData {
  types: Type[];
  action: TypesUpdateAction;
}

export interface SSEMessage {
  id?: number;
  data: TypesUpdateData;
  action: TypesUpdateAction;
}

export function useTypesListener(
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
    const eventSource = new EventSource(`/api/type/listen`);

    eventSource.onmessage = (occurrence) => {
      try {
        const receivedMessage = JSON.parse(occurrence.data);
        const value = receivedMessage?.data;
        const types: Type[] = Array.isArray(value) ? value : [];
        const message: SSEMessage = {
          id: receivedMessage.id,
          action: receivedMessage.action,
          data: {
            action: receivedMessage.action,
            types,
          },
        };

        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
          onMessageRef.current(message);
        }, debounceMs);
      } catch (error) {
        console.log(error);
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
