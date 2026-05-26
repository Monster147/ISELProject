import {useEffect} from "react";
import {Occurrence} from "@commons/models/intervenor/Occurrence";

export type OccurrencesUpdateAction =
    | "OccurrencesChanged"

export interface OccurrenceUpdateData{
    occurrences: Occurrence[]
    action: OccurrencesUpdateAction
}

export interface SSEMessage {
    id?: number;
    data: OccurrenceUpdateData
    action: OccurrencesUpdateAction
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

export function useOccurrencesListener(
    userID: number | undefined,
    onMessage: (message: SSEMessage) => void,
    enabled: boolean | null,
    debounceMs: number = 1000
) {
    useEffect(() => {
        if (!userID || enabled !== true) return;

        const eventSource = new EventSource(`/api/occurrence/listen/user/${userID}`);

        const debouncedOnMessage = debounce(onMessage, debounceMs)

        eventSource.onmessage = (occurrence) =>{
            try {
                const receivedMessage = JSON.parse(occurrence.data);
                const value = receivedMessage?.data
                const occurrences: Occurrence[] = Array.isArray(value) ? value : [];
                const message: SSEMessage = {
                    id: receivedMessage.id,
                    action: receivedMessage.action,
                    data: {
                        action: receivedMessage.action,
                        occurrences,
                    },
                };

                debouncedOnMessage(message)

            }catch (error){
                console.log(error)
                console.error("Error parsing SSE message:", error);
            }
        }

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };

    }, [userID,onMessage, enabled, debounceMs]);
}