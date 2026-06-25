import { createContext, useCallback, useMemo } from "react";
import { api } from "@commons/api/api";

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
  const getOverviewStats = useCallback(async () => {
    try {
      const response = await api.getOverviewStats();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const getStatsReportByType = useCallback(async () => {
    try {
      const response = await api.getStatsReportByType();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const getStatsReportByStatus = useCallback(async () => {
    try {
      const response = await api.getStatsReportByStatus();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const getStatsOccurrenceByImportance = useCallback(async () => {
    try {
      const response = await api.getStatsOccurrenceByImportance();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const getStatsReportByTypeThisMonth = useCallback(async () => {
    try {
      const response = await api.getStatsReportByTypeThisMonth();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const getStatsReportByStatusThisMonth = useCallback(async () => {
    try {
      const response = await api.getStatsReportByStatusThisMonth();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const getStatsOccurrenceByImportanceThisMonth = useCallback(async () => {
    try {
      const response = await api.getStatsOccurrenceByImportanceThisMonth();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const value = useMemo(
    () => ({
      getOverviewStats,
      getStatsReportByType,
      getStatsReportByStatus,
      getStatsOccurrenceByImportance,
      getStatsReportByTypeThisMonth,
      getStatsReportByStatusThisMonth,
      getStatsOccurrenceByImportanceThisMonth,
    }),
    [
      getOverviewStats,
      getStatsReportByType,
      getStatsReportByStatus,
      getStatsOccurrenceByImportance,
      getStatsReportByTypeThisMonth,
      getStatsReportByStatusThisMonth,
      getStatsOccurrenceByImportanceThisMonth,
    ],
  );

  return (
    <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
  );
}
