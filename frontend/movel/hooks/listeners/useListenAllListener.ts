import { useEffect, useRef } from "react";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";

export type SSEMessage =
  | { action: "IntervenorsChanged"; data: any }
  | { action: "EvidenceChanged"; data: any }
  | { action: "DocumentsChanged"; data: any }
  | { action: "OccurrencesChanged"; data: any }
  | { action: "TypesChanged"; data: any };

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
