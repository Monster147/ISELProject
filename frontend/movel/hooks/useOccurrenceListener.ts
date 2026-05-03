import { Occurrence } from "@commons/models/intervenor/Occurrence";
import { useEffect } from "react";
import EventSource from "react-native-sse";

export type OccurrenceUpdateAction =
    | "EvidenceCreated"
    | "EvidenceDeleted"
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
    enabled: boolean | null
) {
    useEffect(() => {
        if (!occurrenceId || enabled!==true) return;

        const es = new EventSource(
            `https://unfabricated-everett-surveyable.ngrok-free.dev/api/occurrence/${Number(occurrenceId)}/listen`
        );

        const listener = (event: any) => {
            try {
                const message: SSEMessage = JSON.parse(event.data);
                onMessage(message);
            } catch (error) {
                console.error("Failed to parse SSE message", error);
            }
        };

        es.addEventListener("message", listener);

        es.addEventListener("error", (event) => {
            console.error("SSE Error:", event);
            es.close();
        });

        return () => {
            es.removeAllEventListeners();
            es.close();
        };
    }, [occurrenceId, onMessage, enabled]);
}