import {Intervenor} from "@commons/models/intervenor/Intervenor";
import {useEffect} from "react";

export type IntervenorsUpdateAction =
    | "IntervenorsChanged"

export interface IntervenorsUpdateData{
    intervenors: Intervenor[]
    action: IntervenorsUpdateAction
}

export interface SSEMessage {
    id?: number;
    data: IntervenorsUpdateData
    action: IntervenorsUpdateAction
}

export function useIntervenorsListener(
    onMessage: (message: SSEMessage) => void,
    enabled: boolean | null
) {
    useEffect(() => {
        if(enabled !== true) return
        const eventSource = new EventSource(`/api/intervenor/listen`)

        eventSource.onmessage = (intervenor) =>{
            try {
                const receivedMessage = JSON.parse(intervenor.data);
                const value = receivedMessage?.data
                const intervenors: Intervenor[] = Array.isArray(value) ? value : [];
                const message: SSEMessage = {
                    id: receivedMessage.id,
                    action: receivedMessage.action,
                    data: {
                        action: receivedMessage.action,
                        intervenors,
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

    }, [onMessage, enabled]);
}