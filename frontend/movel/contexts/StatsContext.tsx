import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, ApiError, fetchApi, getAuthHeaders } from "@commons/api/api";

type StatsContextValue = {
  getOverviewStats: () => Promise<any>;
  getStatsReportByType: () => Promise<any>;
  getStatsReportByStatus: () => Promise<any>;
  getStatsOccurrenceByImportance: () => Promise<any>;
  getStatsReportByTypeThisMonth: () => Promise<any>;
  getStatsReportByStatusThisMonth: () => Promise<any>;
  getStatsOccurrenceByImportanceThisMonth: () => Promise<any>;
};

export const StatsContext = createContext<StatsContextValue | undefined>(
  undefined,
);

export function StatsProvider({ children }) {
  async function getOverviewStats() {
    try {
      const response = await api.getOverviewStats();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function getStatsReportByType() {
    try {
      const response = await api.getStatsReportByType();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function getStatsReportByStatus() {
    try {
      const response = await api.getStatsReportByStatus();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function getStatsOccurrenceByImportance() {
    try {
      const response = await api.getStatsOccurrenceByImportance();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function getStatsReportByTypeThisMonth() {
    try {
      const response = await api.getStatsReportByTypeThisMonth();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function getStatsReportByStatusThisMonth() {
    try {
      const response = await api.getStatsReportByStatusThisMonth();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function getStatsOccurrenceByImportanceThisMonth() {
    try {
      const response = await api.getStatsOccurrenceByImportanceThisMonth();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  return (
    <StatsContext.Provider
      value={{
        getOverviewStats,
        getStatsReportByType,
        getStatsReportByStatus,
        getStatsOccurrenceByImportance,
        getStatsReportByTypeThisMonth,
        getStatsReportByStatusThisMonth,
        getStatsOccurrenceByImportanceThisMonth,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}
