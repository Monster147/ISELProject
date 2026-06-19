import { Occurrence } from "@commons/models/intervenor/Occurrence";
import { useEffect, useRef } from "react";

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

function debounce(cb, delay) {
  let timeout;
  return function (message) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      cb(message);
    }, delay);
  };
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

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId || !occurrenceId || enabled !== true) return;

    const eventSource = new EventSource(
      `/api/occurrence/${Number(occurrenceId)}/listen`,
    );

    eventSource.onmessage = (occurrence) => {
      try {
        const message: SSEMessage = JSON.parse(occurrence.data);
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
  }, [occurrenceId, enabled, debounceMs, userId]);
}
