import { createContext, useCallback, useEffect, useState } from "react";
import { Type } from "@commons/models/type/Type";
import { api, fetchApi } from "@commons/api/api";
import { useAuth } from "../../hooks/useAuth";
import { useTypesListener, SSEMessage } from "../../../hooks/useTypesListener";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { CreateReportInput } from "@commons/models/report/CreateReportInput";
import { Report } from "@commons/models/report/Report";
import { StatusInput } from "@commons/models/report/StatusInput";
import { EditorInput } from "@commons/models/report/EditorInput";
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
  updateReportStatus: (input: StatusInput, status: string) => Promise<Report>;
  submitReport: (id: number) => Promise<Boolean>;
  updateReport: (id: number) => Promise<Report>;
  downloadReport: (id: number) => Promise<any>;
};

export const ReportContext = createContext<ReportContextValue | undefined>(
  undefined,
);

export const ReportProvider = ({ children }) => {
  async function createReport(
    creatorId: number,
    occurrenceId: number,
    title: string,
    description: string,
    addons: Json,
    language: string,
  ): Promise<void> {
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
  }

  async function findReportByOccurrenceId(
    occurrenceId: number,
  ): Promise<Report> {
    try {
      const response = await api.findReportByOccurrenceId(occurrenceId);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function findReportById(id: number): Promise<Report> {
    try {
      const response = await api.findReportById(id);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function findAllReports(): Promise<Report[]> {
    try {
      const response = await api.findAllReports();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function findByStatus(status: string): Promise<Report[]> {
    try {
      const response = await api.findByStatus(status);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function findByCreator(creatorId: number): Promise<Report[]> {
    try {
      const response = await api.findByCreator(creatorId);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function deleteReportById(id: number): Promise<void> {
    try {
      await api.deleteReportById(id);
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function updateReportStatus(
    input: StatusInput,
    id: number,
  ): Promise<Report> {
    try {
      const response = await api.updateReportStatus(input, id);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function submitReport(id: number): Promise<Boolean> {
    try {
      const response = await api.submitReport(id);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function updateReport(id: number): Promise<Report> {
    try {
      const response = await api.updateReport(id);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function downloadReport(id: number): Promise<any> {
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
  }

  return (
    <ReportContext.Provider
      value={{
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
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};
