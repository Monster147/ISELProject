import {useEffect} from "react";
import {Occurrence} from "@commons/models/intervenor/Occurrence";

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
        const eventSource = new EventSource(`/api/occurrence/listen`)

        eventSource.onmessage = (occurrence) =>{
            try {
                const receivedMessage = JSON.parse(occurrence.data);
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

    }, [onMessage]);
}