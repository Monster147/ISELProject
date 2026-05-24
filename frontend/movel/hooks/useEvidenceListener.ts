import {useEffect} from "react";
import EventSource from "react-native-sse";
import {Evidence} from "@commons/models/evidence/Evidence";

export type EvidenceUpdateAction=
    | "EvidenceCreated"
    | "EvidenceDeleted"

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
    enabled: boolean | null
) {
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
    }, [userId, onMessage, enabled]);
}