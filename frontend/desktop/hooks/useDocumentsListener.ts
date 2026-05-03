import {useEffect} from "react";
import {Documents} from "@commons/models/documents/Documents";

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

export function useDocumentsListener(
    onMessage: (message:SSEMessage) => void,
    enabled: boolean | null
) {
    useEffect(() => {
        if(enabled !== true) return
        const eventSource = new EventSource(`/api/documents/listen`)

        eventSource.onmessage = (occurrence) =>{
            try {
                const receivedMessage = JSON.parse(occurrence.data);
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
        }

    }, [onMessage, enabled])
}