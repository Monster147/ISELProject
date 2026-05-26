import { Occurrence } from "@commons/models/intervenor/Occurrence";
import { useEffect } from "react";
import EventSource from "react-native-sse";

export type OccurrenceUpdateAction =
    | "EvidenceCreated"
    | "EvidenceDeleted"
    | "EvidenceUpdated"
    | "OccurrenceCreated"
    | "OccurrenceDeleted"
    | "IntervenorAdded"
    | "IntervenorRemoved"

export interface OccurrenceUpdateData {
    occurrence?: Occurrence
    action: OccurrenceUpdateAction
}

export interface SSEMessage {
    id?: number
    data: OccurrenceUpdateData
    action: OccurrenceUpdateAction
}

function debounce(cb, delay) {
    let timeout
    return function(message) {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            cb(message)
        }, delay)
    };
}

export function useOccurrenceListener(
    occurrenceId: string | undefined,
    onMessage: (message: SSEMessage) => void,
    enabled: boolean | null,
    debounceMs: number = 1000
) {
    useEffect(() => {
        if (!occurrenceId || enabled!==true) return;

        const es = new EventSource(
            `https://unfabricated-everett-surveyable.ngrok-free.dev/api/occurrence/${Number(occurrenceId)}/listen`
        );

        const debouncedOnMessage = debounce(onMessage, debounceMs)

        const listener = (event: any) => {
            try {
                const message: SSEMessage = JSON.parse(event.data);
                debouncedOnMessage(message)
            } catch (error) {
                console.error("Failed to parse SSE message", error);
            }
        };

        es.addEventListener("message", listener);

        es.addEventListener("error", (event) => {
            console.error("SSE Error:", event);
            es.removeAllEventListeners();
            es.close();
        });

        return () => {
            es.removeAllEventListeners();
            es.close();
        };
    }, [occurrenceId, enabled]);
}