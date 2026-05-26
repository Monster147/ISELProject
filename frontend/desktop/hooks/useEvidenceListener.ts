import {useEffect} from "react";
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

export function useEvidenceListener(
    userId: number | undefined,
    onMessage: (message:SSEMessage) => void,
    enabled: boolean | null,
    debounceMs: number = 1000
) {
    useEffect(() => {
        if (!userId || enabled !== true) return;

        const eventSource = new EventSource(`/api/evidence/${Number(userId)}/listen`)

        const debouncedOnMessage = debounce(onMessage, debounceMs)

        eventSource.onmessage = (evidence) => {
            try {
                const receivedMessage = JSON.parse(evidence.data);
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

                debouncedOnMessage(message)
            } catch (error) {
                console.error("Error parsing SSE message:", error);
            }
        }

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
        }

        return () => {
            eventSource.close();
        }
    }, [userId, enabled]);
}