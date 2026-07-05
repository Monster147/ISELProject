import { useEffect } from "react";
import { getAPIUrl } from "@utils/getAPIUrl";

export type ReportUpdateAction =
  | "ReportCreated"
  | "ReportDeleted"
  | "ReportStatusChanged"
  | "EditorAdded"
  | "EditorRemoved";

export interface ReportUpdateData {
  occurrenceId: number;
  action: ReportUpdateAction;
}

export interface SSEMessage {
  id?: number;
  data: ReportUpdateAction;
  action: ReportUpdateData;
}

/**
 * Hook que subscreve atualizações de um relatório específico em tempo real via SSE.
 * Abre uma ligação ao endpoint `/api/report/{reportId}/listen` e invoca `onMessage`
 * a cada evento recebido (sem debounce).
 * A ligação é encerrada automaticamente quando o componente desmonta ou os deps mudam.
 * A ligação só é estabelecida se `enabled` for true, `userId` e `reportId` estiverem definidos, garantindo que apenas
 * utilizadores autenticados, com conexão à internet e com um relatório válida recebem eventos.
 * Evento SSE não utilizado.
 *
 * @param userId Identificador do utilizador autenticado.
 * @param reportId Identificador do relatório a observar.
 * @param onMessage Callback invocado com a mensagem SSE recebida.
 * @param enabled Controla se a ligação SSE deve estar ativa (true para ativar).
 */
export function useReportListener(
  userId: number | undefined,
  reportId: string | undefined,
  onMessage: (message: SSEMessage) => void,
  enabled: boolean | null,
) {
  useEffect(() => {
    if (!userId || !reportId || enabled !== true) return;

    const eventSource = new EventSource(
      `${getAPIUrl()}/report/${Number(reportId)}/listen`,
    );

    eventSource.onmessage = (report) => {
      try {
        const message: SSEMessage = JSON.parse(report.data);
        onMessage(message);
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [reportId, enabled, userId]);
}
