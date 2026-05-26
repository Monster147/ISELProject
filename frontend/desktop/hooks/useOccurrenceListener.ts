import {Occurrence} from "@commons/models/intervenor/Occurrence";
import {useEffect} from "react";

export type OccurrenceUpdateAction =
    | "EvidenceCreated"
    | "EvidenceDeleted"
    | "EvidenceUpdated"
    | "OccurrenceCreated"
    | "OccurrenceDeleted"
    | "IntervenorAdded"
    | "IntervenorRemoved"


export interface OccurrenceUpdateData{
    occurrence?: Occurrence
    action: OccurrenceUpdateAction
}

export interface SSEMessage{
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
    onMessage: (message:SSEMessage) => void,
    enabled: boolean | null,
    debounceMs: number = 1000
) {
    useEffect(() => {
        if (!occurrenceId || enabled !== true) return;

        const eventSource = new EventSource(`/api/occurrence/${Number(occurrenceId)}/listen`)

        const debouncedOnMessage = debounce(onMessage, debounceMs)

        eventSource.onmessage = (occurrence) =>{
            try {
                const message: SSEMessage = JSON.parse(occurrence.data)
                debouncedOnMessage(message)
            }catch (error){
                console.error("Failed to parse SSE message", error)
            }
        }

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };

    }, [occurrenceId, onMessage, enabled]);

}

