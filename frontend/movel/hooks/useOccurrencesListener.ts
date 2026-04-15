import {useEffect} from "react";
import {Occurrence} from "@commons/models/intervenor/Occurrence";
import EventSource from "react-native-sse";

export type OccurrencesUpdateAction =
    | "OccurrencesChanged"

export interface OccurrenceUpdateData{
    occurrences: Occurrence[]
    action: OccurrencesUpdateAction
}

export interface SSEMessage {
    id?: number;
    data: OccurrenceUpdateData
    action: OccurrencesUpdateAction
}

export function useOccurrencesListener(
    onMessage: (message: SSEMessage) => void
) {
    useEffect(() => {
        const es = new EventSource(`https://unfabricated-everett-surveyable.ngrok-free.dev/api/occurrence/listen`);

        const onEvent = (event: any) => {
            try {
                const receivedMessage = JSON.parse(event.data);
                const value = receivedMessage?.data?.value;
                const occurrences: Occurrence[] = Array.isArray(value) ? value : [];

                const message: SSEMessage = {
                    id: receivedMessage.id,
                    action: receivedMessage.action,
                    data: {
                        action: receivedMessage.action,
                        occurrences,
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
    }, [onMessage]);
}