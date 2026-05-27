import {useEffect, useRef} from "react";
import {Documents} from "@commons/models/documents/Documents";
import {Type} from "../../commons/models/type/Type";
import RNEventSource from "react-native-event-source";

export type TypesUpdateAction=
    | "TypesChanged"

export interface TypesUpdateData{
    types: Type[]
    action: TypesUpdateAction
}

export interface SSEMessage{
    id?: number
    data: TypesUpdateData
    action: TypesUpdateAction
}

export function useTypesListener(
    onMessage: (message:SSEMessage) => void,
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
        if(enabled !== true) return
        const es = new RNEventSource(`https://unfabricated-everett-surveyable.ngrok-free.dev/api/type/listen`);
        esRef.current = es;
        const onEvent = (event: any) => {
            try {
                const receivedMessage = JSON.parse(event.data);
                const value = receivedMessage?.data
                const types: Type[] = Array.isArray(value) ? value : [];

                const message: SSEMessage = {
                    id: receivedMessage.id,
                    action: receivedMessage.action,
                    data: {
                        action: receivedMessage.action,
                        types,
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

        es.addEventListener("message", onEvent);
        es.addEventListener("error", onError);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
            try {
                es.removeListener("message", onEvent);
                es.removeListener("error", onError);
                es.close();
            } catch (e) {
                console.warn("Error closing EventSource:", e);
            }
            esRef.current = null;
        };
    }, [enabled, debounceMs])
}