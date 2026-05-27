import { Occurrence } from "@commons/models/intervenor/Occurrence";
import {useEffect, useRef} from "react";
import RNEventSource from "react-native-event-source";

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

export function useOccurrenceListener(
    occurrenceId: string | undefined,
    onMessage: (message: SSEMessage) => void,
    enabled: boolean | null,
    debounceMs: number = 1000
) {
    const onMessageRef = useRef(onMessage)
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const esRef = useRef<RNEventSource | null>(null);
    useEffect(() => {
        onMessageRef.current = onMessage
    }, [onMessage])

    useEffect(() => {
        if (!occurrenceId || enabled!==true) return;

        const es = new RNEventSource(
            `https://unfabricated-everett-surveyable.ngrok-free.dev/api/occurrence/${Number(occurrenceId)}/listen`
        );
        esRef.current = es;
        const listener = (event: any) => {
            try {
                const message: SSEMessage = JSON.parse(event.data);
                if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current)
                }
                debounceTimeoutRef.current = setTimeout(() => {
                    onMessageRef.current(message)
                }, debounceMs)
            } catch (error) {
                console.error("Failed to parse SSE message", error);
            }
        };

        const onError = (event: any) => {
            console.error("SSE Error:", event);
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            try {
                es.removeAllListeners();
                es.close();
            } catch (e) {
                console.warn("Error closing EventSource:", e);
            }
        };

        es.addEventListener("message", listener);
        es.addEventListener("error", onError);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
            try {
                es.removeListener("message", listener);
                es.removeListener("error", onError);
                es.close();
            } catch (e) {
                console.warn("Error closing EventSource:", e);
            }
            esRef.current = null;
        };
    }, [occurrenceId, enabled, debounceMs]);
}