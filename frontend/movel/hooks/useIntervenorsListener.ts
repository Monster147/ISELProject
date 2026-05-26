import {Intervenor} from "@commons/models/intervenor/Intervenor";
import {useEffect, useRef} from "react";
import EventSource from "react-native-sse";

export type IntervenorsUpdateAction =
    | "IntervenorsChanged"

export interface IntervenorsUpdateData{
    intervenors: Intervenor[]
    action: IntervenorsUpdateAction
}

export interface SSEMessage {
    id?: number;
    data: IntervenorsUpdateData
    action: IntervenorsUpdateAction
}

export function useIntervenorsListener(
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
        if(enabled !== true) return
        const es = new EventSource(`https://unfabricated-everett-surveyable.ngrok-free.dev/api/intervenor/listen`);
        esRef.current = es;
        const onEvent = (event: any) => {
            try {
                const receivedMessage = JSON.parse(event.data);
                const value = receivedMessage?.data
                const intervenors: Intervenor[] = Array.isArray(value) ? value : [];

                const message: SSEMessage = {
                    id: receivedMessage.id,
                    action: receivedMessage.action,
                    data: {
                        action: receivedMessage.action,
                        intervenors,
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
    }, [enabled, debounceMs]);
}