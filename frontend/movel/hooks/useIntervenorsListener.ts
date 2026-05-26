import {Intervenor} from "@commons/models/intervenor/Intervenor";
import {useEffect} from "react";
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

export function useIntervenorsListener(
    onMessage: (message: SSEMessage) => void,
    enabled: boolean | null,
    debounceMs: number = 1000
) {
    useEffect(() => {
        if(enabled !== true) return
        const es = new EventSource(`https://unfabricated-everett-surveyable.ngrok-free.dev/api/intervenor/listen`);

        const debouncedOnMessage = debounce(onMessage, debounceMs)

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
    }, [enabled]);
}