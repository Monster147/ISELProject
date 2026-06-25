import { useEffect, useRef } from "react";
import EventSource from "react-native-sse";
import { Evidence } from "@commons/models/evidence/Evidence";
import { API_URL } from "@commons/constants/apiurl";

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

export function useEvidenceListener(
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
    if (!userId || enabled !== true) {
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
      `${API_URL}/api/evidence/${Number(userId)}/listen`,
    );

    esRef.current = es;
    const onEvent = (event: any) => {
      try {
        const receivedMessage = JSON.parse(event.data);
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
  }, [userId, enabled, debounceMs]);
}
