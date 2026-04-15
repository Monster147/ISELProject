import {useEffect} from "react";

export type EvidenceUpdateAction=
    | "EvidenceCreated"
    | "EvidenceDeleted"

export interface EvidenceUpdateData{
    occurrenceId: number
    action: EvidenceUpdateAction
}

export interface SSEMessage{
    id?: number
    data: EvidenceUpdateData
    action: EvidenceUpdateAction
}

//Precisa de ser updated depois
export function useEvidenceListener(
    evidenceId: string | undefined,
    onMessage: (message:SSEMessage) => void
) {
    useEffect(() => {
        if (!evidenceId) return;

        const eventSource = new EventSource(`/api/evidence/${Number(evidenceId)}/listen`)

        eventSource.onmessage = (evidence) => {
            try {
                const message: SSEMessage = JSON.parse(evidence.data);
                onMessage(message);
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
    }, [evidenceId, onMessage]);
}