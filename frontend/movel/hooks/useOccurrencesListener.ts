import {useEffect, useRef} from "react";
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

export function useOccurrencesListener(
    userID: number | undefined,
    onMessage: (message: SSEMessage) => void,
    enabled: boolean | null,
    debounceMs: number = 1000
) {
    const onMessageRef = useRef(onMessage)
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const esRef = useRef<EventSource | null>(null);
    useEffect(() => {
        onMessageRef.current = onMessage
    }, [onMessage])

    useEffect(() => {
        if (!userID || enabled !== true) return;
        const es = new EventSource(`https://unfabricated-everett-surveyable.ngrok-free.dev/api/occurrence/listen/user/${userID}`);
        esRef.current = es;
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

                if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current)
                }
                debounceTimeoutRef.current = setTimeout(() => {
                    onMessageRef.current(message)
                }, debounceMs)

            } catch (error) {
                console.error("Error parsing SSE message:", error);
            }
        };

        es.addEventListener("message", onEvent);
        es.addEventListener("error", (event) => {
            console.error("SSE Error:", event);
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
            try {
                es.removeAllEventListeners();
                es.close();
            } catch (e) {
                console.warn("Error closing EventSource:", e);
            }
        });

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
            try {
                es.removeAllEventListeners();
                es.close();
            } catch (e) {
                console.warn("Error closing EventSource:", e);
            }
            esRef.current = null;
        };
    }, [userID, enabled, debounceMs]);
}