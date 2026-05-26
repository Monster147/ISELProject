import {Intervenor} from "@commons/models/intervenor/Intervenor";
import {useEffect} from "react";

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
        const eventSource = new EventSource(`/api/intervenor/listen`)

        const debouncedOnMessage = debounce(onMessage, debounceMs)

        eventSource.onmessage = (intervenor) =>{
            try {
                const receivedMessage = JSON.parse(intervenor.data);
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

    }, [enabled]);
}