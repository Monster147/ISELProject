import { Occurrence } from "@commons/models/intervenor/Occurrence";
import { useEffect, useRef } from "react";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";
import { log } from "./useDocumentsListener";

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
      log("[SSE Occurrence] disabled, skipping");
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
      `${API_URL}/api/occurrence/${Number(occurrenceId)}/listen`,
    );

    log("[SSE Occurrence] connecting...");
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
      log("[SSE Occurrence] error");
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
      log("[SSE Occurrence] cleanup");
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
