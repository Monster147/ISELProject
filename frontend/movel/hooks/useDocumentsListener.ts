import {useEffect} from "react";
import {Documents} from "../../commons/models/Documents/Documents";
import EventSource from "react-native-sse"

export type DocumentsUpdateAction=
    | "DocumentsChanged"

export interface DocumentsUpdateData{
    documents: Documents[]
    action: DocumentsUpdateAction
}

export interface SSEMessage{
    id?: number
    data: DocumentsUpdateData
    action: DocumentsUpdateAction
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

export function useDocumentsListener(
    onMessage: (message:SSEMessage) => void,
    enabled: boolean | null,
    debounceMs: number = 1000
) {
    useEffect(() => {
        if(enabled !== true) return
        const es = new EventSource(`https://unfabricated-everett-surveyable.ngrok-free.dev/api/documents/listen`);

        const debouncedOnMessage = debounce(onMessage, debounceMs)

        const onEvent = (event: any) => {
            try {
                const receivedMessage = JSON.parse(event.data);
                const value = receivedMessage?.data
                const documents: Documents[] = Array.isArray(value) ? value : [];

                const message: SSEMessage = {
                    id: receivedMessage.id,
                    action: receivedMessage.action,
                    data: {
                        action: receivedMessage.action,
                        documents,
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

    }, [onMessage, enabled])
}