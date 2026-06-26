import React from "react";
import { renderHook } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { StatsProvider } from "@contexts/StatsContext";
import { useStats } from "@hooks/data/useStats";

jest.mock("@commons/api/api", () => ({
  api: {
    getOverviewStats: jest.fn(),
    getStatsReportByType: jest.fn(),
    getStatsReportByStatus: jest.fn(),
    getStatsOccurrenceByImportance: jest.fn(),
    getStatsReportByTypeThisMonth: jest.fn(),
    getStatsReportByStatusThisMonth: jest.fn(),
    getStatsOccurrenceByImportanceThisMonth: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <StatsProvider>{children}</StatsProvider>
);
const render = () => renderHook(() => useStats(), { wrapper });

beforeEach(() => jest.clearAllMocks());

describe("movel StatsContext / useStats", () => {
  const methods: Array<keyof ReturnType<typeof useStats>> = [
    "getOverviewStats",
    "getStatsReportByType",
    "getStatsReportByStatus",
    "getStatsOccurrenceByImportance",
    "getStatsReportByTypeThisMonth",
    "getStatsReportByStatusThisMonth",
    "getStatsOccurrenceByImportanceThisMonth",
  ];

  it.each(methods)(
    "%s delegates to the matching api method",
    async (method) => {
      const payload = { value: method };
      (mockApi[method] as jest.Mock).mockResolvedValueOnce(payload);
      const { result } = render();
      await expect(
        (result.current[method] as () => Promise<any>)(),
      ).resolves.toBe(payload);
      expect(mockApi[method]).toHaveBeenCalledTimes(1);
    },
  );

  it("throws when used outside of a StatsProvider", () => {
    expect(() => renderHook(() => useStats())).toThrow(
      /must be used within StatsProvider/,
    );
  });
});
