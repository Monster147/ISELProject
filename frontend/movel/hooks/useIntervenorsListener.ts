import { Intervenor } from "@commons/models/intervenor/Intervenor";
import { useEffect, useRef } from "react";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";
import { log } from "./useDocumentsListener";

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

export function useIntervenorsListener(
  userId: number | undefined,
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
    if (enabled !== true || !userId) {
      log("[SSE Intervenors] disabled, skipping");
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

    log("[SSE Intervenors] connecting...");
    const es = new EventSource(`${API_URL}/api/intervenor/listen`);
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
      log("[SSE Intervenors] error");
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
      log("[SSE Intervenors] cleanup");
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
  }, [enabled, debounceMs, userId]);
}
