import { createContext, useCallback, useMemo } from "react";
import { api } from "@commons/api/api";
import { CreateReportInput } from "@commons/models/report/CreateReportInput";
import { Report } from "@commons/models/report/Report";
import { StatusInput } from "@commons/models/report/StatusInput";
import { Json } from "@commons/models/utils/Json";

type ReportContextValue = {
  createReport: (
    creatorId: number,
    occurrenceId: number,
    title: string,
    description: string,
    addons: Json,
    language: string,
  ) => Promise<void>;
  findReportByOccurrenceId: (occurrenceId: number) => Promise<Report>;
  findReportById: (id: number) => Promise<Report>;
  findAllReports: () => Promise<Report[]>;
  findByStatus: (status: string) => Promise<Report[]>;
  findByCreator: (creatorId: number) => Promise<Report[]>;
  deleteReportById: (id: number) => Promise<void>;
  updateReportStatus: (input: StatusInput, status: number) => Promise<Report>;
  submitReport: (id: number) => Promise<Boolean>;
  updateReport: (id: number) => Promise<Report>;
  downloadReport: (id: number) => Promise<any>;
};

export const ReportContext = createContext<ReportContextValue | undefined>(
  undefined,
);

/**
 * Provider que disponibiliza as operações de relatórios na aplicação desktop.
 * Não mantém estado local de relatórios, as operações delegam diretamente na API.
 * O download de relatórios é feito diretamente via fetch com criação de link temporário.
 *
 * @param children Componentes filhos que terão acesso ao contexto de relatórios.
 */
export const ReportProvider = ({ children }) => {
  const createReport = useCallback(
    async (
      creatorId: number,
      occurrenceId: number,
      title: string,
      description: string,
      addons: Json,
      language: string,
    ): Promise<void> => {
      try {
        const input: CreateReportInput = {
          creatorId,
          occurrenceId,
          title,
          description,
          addons,
          language,
        };
        await api.createReport(input);
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [],
  );

  const findReportByOccurrenceId = useCallback(
    async (occurrenceId: number): Promise<Report> => {
      try {
        const response = await api.findReportByOccurrenceId(occurrenceId);
        return response;
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [],
  );

  const findReportById = useCallback(async (id: number): Promise<Report> => {
    try {
      const response = await api.findReportById(id);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const findAllReports = useCallback(async (): Promise<Report[]> => {
    try {
      const response = await api.findAllReports();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const findByStatus = useCallback(
    async (status: string): Promise<Report[]> => {
      try {
        const response = await api.findByStatus(status);
        return response;
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [],
  );

  const findByCreator = useCallback(
    async (creatorId: number): Promise<Report[]> => {
      try {
        const response = await api.findByCreator(creatorId);
        return response;
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [],
  );

  const deleteReportById = useCallback(async (id: number): Promise<void> => {
    try {
      await api.deleteReportById(id);
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const updateReportStatus = useCallback(
    async (input: StatusInput, id: number): Promise<Report> => {
      try {
        const response = await api.updateReportStatus(input, id);
        return response;
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [],
  );

  const submitReport = useCallback(async (id: number): Promise<Boolean> => {
    try {
      const response = await api.submitReport(id);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const updateReport = useCallback(async (id: number): Promise<Report> => {
    try {
      const response = await api.updateReport(id);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const downloadReport = useCallback(async (id: number): Promise<any> => {
    try {
      const response = await fetch(`/api/report/${id}/download`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer download");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] ?? "download";

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const value = useMemo(
    () => ({
      createReport,
      findReportById,
      findReportByOccurrenceId,
      findAllReports,
      findByCreator,
      findByStatus,
      deleteReportById,
      updateReportStatus,
      submitReport,
      updateReport,
      downloadReport,
    }),
    [
      createReport,
      findReportById,
      findReportByOccurrenceId,
      findAllReports,
      findByCreator,
      findByStatus,
      deleteReportById,
      updateReportStatus,
      submitReport,
      updateReport,
      downloadReport,
    ],
  );

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
};
