import {useEffect} from "react";
import {Occurrence} from "@commons/models/intervenor/Occurrence";
import EventSource from "react-native-sse";

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
        const es = new EventSource(`https://unfabricated-everett-surveyable.ngrok-free.dev/api/occurrence/listen/user/${userID}`);

        const debouncedOnMessage = debounce(onMessage, debounceMs)

        const onEvent = (event: any) => {
            try {
                const receivedMessage = JSON.parse(event.data);
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
            } catch (error) {
                console.error("Error parsing SSE message:", error);
            }
        };

        es.addEventListener("message", onEvent);
        es.addEventListener("error", (event) => {
            console.error("SSE Error:", event);
            es.close();
        });

        return () => {
            es.removeAllEventListeners();
            es.close();
        };
    }, [userID,onMessage, enabled, enabled]);
}