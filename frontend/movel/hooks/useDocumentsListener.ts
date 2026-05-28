import {useEffect, useRef} from "react";
import {Documents} from "../../commons/models/Documents/Documents";
import EventSource from "react-native-sse"
import {API_URL} from "@commons/constants/apiurl";

export type DocumentsUpdateAction =
    | "DocumentsChanged"

export interface DocumentsUpdateData {
    documents: Documents[]
    action: DocumentsUpdateAction
}

export interface SSEMessage {
    id?: number
    data: DocumentsUpdateData
    action: DocumentsUpdateAction
}

const LOG_PREFIX = "[SSE]";

export const log = (...args: any[]) =>
    console.log(LOG_PREFIX, ...args);


export function useDocumentsListener(
    userId: number | undefined,
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
        if (enabled !== true || !userId) {
            log('[SSE Documents] disabled, skipping')
            return
        }

        if (esRef.current) {
            try {
                esRef.current.removeAllEventListeners();
                esRef.current.close();
            } catch (e) {
                console.warn("Error closing previous SSE", e);
            }

            esRef.current = null;
        }

        log('[SSE Documents] connecting...')
        const es = new EventSource(`${API_URL}/api/documents/listen`);
        esRef.current = es;
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
            log('[SSE Documents] error')
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
            esRef.current = null;
        });

        return () => {
            log('[SSE Documents] cleanup')
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
            try {
                es.removeAllEventListeners();
                es.close();
            } catch (e) {
                console.warn("Error in cleanup:", e);
            }
            esRef.current = null;
        };

    }, [enabled, debounceMs, userId])
}