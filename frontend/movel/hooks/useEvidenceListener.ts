import {useEffect, useRef} from "react";
import EventSource from "react-native-sse";
import {Evidence} from "@commons/models/evidence/Evidence";

export type EvidenceUpdateAction=
    | "EvidenceCreated"
    | "EvidenceDeleted"
    | "EvidenceUpdated"

export interface EvidenceUpdateData{
    evidences: Evidence[]
    action: EvidenceUpdateAction
}

export interface SSEMessage{
    id?: number
    data: EvidenceUpdateData
    action: EvidenceUpdateAction
}


export function useEvidenceListener(
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
        if (!userId || enabled!== true) return;

        const es = new EventSource(
            `https://unfabricated-everett-surveyable.ngrok-free.dev/api/evidence/${Number(userId)}/listen`
        );

        const onEvent = (event: any) => {
            try {
                const receivedMessage = JSON.parse(event.data);
                const value = receivedMessage?.data
                const evidences: Evidence[] = Array.isArray(value) ? value : [];

                const message: SSEMessage = {
                    id: receivedMessage.id,
                    action: receivedMessage.action,
                    data: {
                        action: receivedMessage.action,
                        evidences,
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
            es.removeAllEventListeners();
            es.close();
        });

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
            es.removeAllEventListeners();
            es.close();
        };
    }, [userId, enabled, debounceMs]);
}