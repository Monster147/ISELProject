import React from "react";
import { renderHook } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { ReportProvider } from "@contexts/ReportContext";
import { useReport } from "@hooks/data/useReport";

jest.mock("@commons/api/api", () => ({
  api: {
    createReport: jest.fn(),
    findReportByOccurrenceId: jest.fn(),
    findReportById: jest.fn(),
    findAllReports: jest.fn(),
    findByStatus: jest.fn(),
    findByCreator: jest.fn(),
    deleteReportById: jest.fn(),
    updateReportStatus: jest.fn(),
    submitReport: jest.fn(),
    updateReport: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReportProvider>{children}</ReportProvider>
);
const render = () => renderHook(() => useReport(), { wrapper });

beforeEach(() => jest.clearAllMocks());

describe("ReportContext / useReport", () => {
  it("createReport assembles the CreateReportInput", async () => {
    (mockApi.createReport as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = render();

    await result.current.createReport(1, 42, "Title", "Desc", {} as any, "pt");

    expect(mockApi.createReport).toHaveBeenCalledWith({
      creatorId: 1,
      occurrenceId: 42,
      title: "Title",
      description: "Desc",
      addons: {},
      language: "pt",
    });
  });

  it("findReportByOccurrenceId delegates to api", async () => {
    (mockApi.findReportByOccurrenceId as jest.Mock).mockResolvedValueOnce({
      id: 5,
    });
    const { result } = render();
    await expect(result.current.findReportByOccurrenceId(42)).resolves.toEqual({
      id: 5,
    });
    expect(mockApi.findReportByOccurrenceId).toHaveBeenCalledWith(42);
  });

  it("findReportById delegates to api", async () => {
    (mockApi.findReportById as jest.Mock).mockResolvedValueOnce({ id: 5 });
    const { result } = render();
    await expect(result.current.findReportById(5)).resolves.toEqual({ id: 5 });
    expect(mockApi.findReportById).toHaveBeenCalledWith(5);
  });

  it("findAllReports delegates to api", async () => {
    (mockApi.findAllReports as jest.Mock).mockResolvedValueOnce([]);
    const { result } = render();
    await expect(result.current.findAllReports()).resolves.toEqual([]);
  });

  it("findByStatus / findByCreator pass their argument through", async () => {
    (mockApi.findByStatus as jest.Mock).mockResolvedValueOnce([]);
    (mockApi.findByCreator as jest.Mock).mockResolvedValueOnce([]);
    const { result } = render();
    await result.current.findByStatus("APPROVED");
    await result.current.findByCreator(1);
    expect(mockApi.findByStatus).toHaveBeenCalledWith("APPROVED");
    expect(mockApi.findByCreator).toHaveBeenCalledWith(1);
  });

  it("deleteReportById delegates to api", async () => {
    (mockApi.deleteReportById as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = render();
    await result.current.deleteReportById(5);
    expect(mockApi.deleteReportById).toHaveBeenCalledWith(5);
  });

  it("updateReportStatus forwards the status input and id", async () => {
    (mockApi.updateReportStatus as jest.Mock).mockResolvedValueOnce({ id: 5 });
    const { result } = render();
    const input = { status: "APPROVED" } as any;
    await result.current.updateReportStatus(input, 5);
    expect(mockApi.updateReportStatus).toHaveBeenCalledWith(input, 5);
  });

  it("submitReport / updateReport delegate to api", async () => {
    (mockApi.submitReport as jest.Mock).mockResolvedValueOnce(true);
    (mockApi.updateReport as jest.Mock).mockResolvedValueOnce({ id: 5 });
    const { result } = render();
    await expect(result.current.submitReport(5)).resolves.toBe(true);
    await expect(result.current.updateReport(5)).resolves.toEqual({ id: 5 });
    expect(mockApi.submitReport).toHaveBeenCalledWith(5);
    expect(mockApi.updateReport).toHaveBeenCalledWith(5);
  });

  describe("downloadReport", () => {
    const fetchMock = jest.fn();
    beforeEach(() => {
      (global as any).fetch = fetchMock;
      fetchMock.mockReset();
    });

    it("downloads the report blob and triggers a browser download", async () => {
      const blob = new Blob(["pdf"]);
      fetchMock.mockResolvedValueOnce({
        ok: true,
        blob: async () => blob,
        headers: {
          get: () => 'attachment; filename="report-5.pdf"',
        },
      });
      const createObjectURL = jest.fn(() => "blob:url");
      const revokeObjectURL = jest.fn();
      (window.URL as any).createObjectURL = createObjectURL;
      (window.URL as any).revokeObjectURL = revokeObjectURL;
      const clickSpy = jest
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(() => {});

      const { result } = render();
      await result.current.downloadReport(5);
      clickSpy.mockRestore();

      expect(fetchMock).toHaveBeenCalledWith("/api/report/5/download", {
        method: "GET",
      });
      expect(createObjectURL).toHaveBeenCalledWith(blob);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:url");
    });

    it("throws when the download response is not ok", async () => {
      fetchMock.mockResolvedValueOnce({ ok: false });
      const { result } = render();
      await expect(result.current.downloadReport(5)).rejects.toThrow(
        "Erro ao fazer download",
      );
    });
  });

  it("throws when used outside of a ReportProvider", () => {
    expect(() => renderHook(() => useReport())).toThrow(
      /must be used within ReportProvider/,
    );
  });
});
