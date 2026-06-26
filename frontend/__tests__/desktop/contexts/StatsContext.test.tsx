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

describe("StatsContext / useStats", () => {
  const cases: Array<
    [keyof ReturnType<typeof useStats>, keyof typeof mockApi]
  > = [
    ["getOverviewStats", "getOverviewStats"],
    ["getStatsReportByType", "getStatsReportByType"],
    ["getStatsReportByStatus", "getStatsReportByStatus"],
    ["getStatsOccurrenceByImportance", "getStatsOccurrenceByImportance"],
    ["getStatsReportByTypeThisMonth", "getStatsReportByTypeThisMonth"],
    ["getStatsReportByStatusThisMonth", "getStatsReportByStatusThisMonth"],
    [
      "getStatsOccurrenceByImportanceThisMonth",
      "getStatsOccurrenceByImportanceThisMonth",
    ],
  ];

  it.each(cases)(
    "%s delegates to api.%s and returns its result",
    async (method, apiMethod) => {
      const payload = { value: apiMethod };
      (mockApi[apiMethod] as jest.Mock).mockResolvedValueOnce(payload);

      const { result } = render();
      await expect(
        (result.current[method] as () => Promise<any>)(),
      ).resolves.toBe(payload);
      expect(mockApi[apiMethod]).toHaveBeenCalledTimes(1);
    },
  );

  it("throws when used outside of a StatsProvider", () => {
    expect(() => renderHook(() => useStats())).toThrow(
      /must be used within StatsProvider/,
    );
  });
});
