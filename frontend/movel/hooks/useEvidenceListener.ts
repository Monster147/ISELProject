import {useEffect} from "react";
import EventSource from "react-native-sse";

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
    onMessage: (message: SSEMessage) => void
) {
    useEffect(() => {
        if (!evidenceId) return;

        const es = new EventSource(
            `https://unfabricated-everett-surveyable.ngrok-free.dev/api/evidence/${Number(evidenceId)}/listen`
        );

        const onEvent = (event: any) => {
            try {
                const message: SSEMessage = JSON.parse(event.data);
                onMessage(message);
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
    }, [evidenceId, onMessage]);
}