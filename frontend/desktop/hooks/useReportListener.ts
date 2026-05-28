import {useEffect} from "react";

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
    userId: number | undefined,
    reportId: string | undefined,
    onMessage: (message:SSEMessage) => void,
    enabled: boolean | null
) {
    useEffect(() => {
        if (!userId || !reportId || enabled !== true) return;

        const eventSource = new EventSource(`/api/report/${Number(reportId)}/listen`)

        eventSource.onmessage = (report) => {
            try {
                const message: SSEMessage = JSON.parse(report.data);
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
    }, [reportId, enabled, userId]);
}