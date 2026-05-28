import {Intervenor} from "@commons/models/intervenor/Intervenor";
import {useEffect, useRef} from "react";

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
    userId: number | undefined,
    onMessage: (message: SSEMessage) => void,
    enabled: boolean | null,
    debounceMs: number = 1000
) {
    const onMessageRef = useRef(onMessage)
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        onMessageRef.current = onMessage
    }, [onMessage])

    useEffect(() => {
        if(enabled !== true || !userId) return
        const eventSource = new EventSource(`/api/intervenor/listen`)


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

                if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current)
                }
                debounceTimeoutRef.current = setTimeout(() => {
                    onMessageRef.current(message)
                }, debounceMs)

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

    }, [enabled, debounceMs, userId]);
}