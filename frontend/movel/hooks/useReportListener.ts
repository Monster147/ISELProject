import {useEffect, useRef} from "react";
import EventSource from "react-native-sse";

export type ReportUpdateAction=
    | "ReportCreated"
    | "ReportDeleted"
    | "ReportStatusChanged"
    | "EditorAdded"
    | "EditorRemoved"

export interface ReportUpdateData{
    occurrenceId: number
    action: ReportUpdateAction
}

export interface SSEMessage{
    id?: number
    data: ReportUpdateAction
    action: ReportUpdateData
}

//Precisa de ser updated depois

export function useReportListener(
    reportId: string | undefined,
    onMessage: (message: SSEMessage) => void,
    enabled: boolean | null
) {
    useEffect(() => {
        if (!reportId || enabled!== true) return;
        const esRef = useRef<EventSource | null>(null);
        const es = new EventSource(
            `https://unfabricated-everett-surveyable.ngrok-free.dev/api/report/${Number(reportId)}/listen`
        );
        esRef.current = es;
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
            try {
                es.removeAllEventListeners();
                es.close();
            } catch (e) {
                console.warn("Error closing EventSource:", e);
            }
        });

        return () => {
            try {
                es.removeAllEventListeners();
                es.close();
            } catch (e) {
                console.warn("Error closing EventSource:", e);
            }
            esRef.current = null;
        };
    }, [reportId, enabled]);
}