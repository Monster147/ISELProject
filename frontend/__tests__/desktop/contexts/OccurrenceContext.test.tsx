import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { useAuth } from "@hooks/data/useAuth";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useOccurrencesListener } from "@hooks/listeners/useOccurrencesListener";
import { OccurrenceProvider } from "@contexts/OccurrenceContext";
import { useOccurrence } from "@hooks/data/useOccurrence";

jest.mock("@commons/api/api", () => ({
  api: {
    findOccurrencesByReporterId: jest.fn(),
    findOccurrenceById: jest.fn(),
    addIntervenor: jest.fn(),
    removeIntervenor: jest.fn(),
  },
}));

jest.mock("@hooks/data/useAuth", () => ({ useAuth: jest.fn() }));

jest.mock("@hooks/system/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

jest.mock("@hooks/listeners/useOccurrencesListener", () => ({
  useOccurrencesListener: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseNetwork = useNetworkStatus as jest.Mock;
const mockListener = useOccurrencesListener as jest.Mock;

const occurrences = [{ id: 1 }, { id: 2 }] as any;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OccurrenceProvider>{children}</OccurrenceProvider>
);
const render = () => renderHook(() => useOccurrence(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: 1 } });
  mockUseNetwork.mockReturnValue({ isOnline: true });
  (mockApi.findOccurrencesByReporterId as jest.Mock).mockResolvedValue([]);
});

describe("OccurrenceContext / useOccurrence", () => {
  it("lists the reporter's occurrences on mount", async () => {
    (mockApi.findOccurrencesByReporterId as jest.Mock).mockResolvedValueOnce(
      occurrences,
    );
    const { result } = render();
    await waitFor(() => expect(result.current.occurrence).toEqual(occurrences));
    expect(mockApi.findOccurrencesByReporterId).toHaveBeenCalledWith(1);
  });

  it("does not list when offline", () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    render();
    expect(mockApi.findOccurrencesByReporterId).not.toHaveBeenCalled();
  });

  it("getOccurrence delegates to findOccurrenceById", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false }); // skip mount auto-load
    (mockApi.findOccurrenceById as jest.Mock).mockResolvedValueOnce({ id: 9 });
    const { result } = render();
    await expect(result.current.getOccurrence(9)).resolves.toEqual({ id: 9 });
    expect(mockApi.findOccurrenceById).toHaveBeenCalledWith(9);
  });

  it("addIntervenorToOccurrence posts then reloads the list", async () => {
    (mockApi.addIntervenor as jest.Mock).mockResolvedValueOnce(undefined);
    (mockApi.findOccurrencesByReporterId as jest.Mock).mockResolvedValue(
      occurrences,
    );
    const { result } = render();
    // flush the mount load first
    await waitFor(() =>
      expect(mockApi.findOccurrencesByReporterId).toHaveBeenCalledTimes(1),
    );
    await act(async () => {
      await result.current.addIntervenorToOccurrence(5, 42);
    });
    expect(mockApi.addIntervenor).toHaveBeenCalledWith({ intervenorId: 5 }, 42);
    // once on mount + once after add
    expect(mockApi.findOccurrencesByReporterId).toHaveBeenCalledTimes(2);
  });

  it("removeIntervenorFromOccurrence deletes then reloads the list", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false }); // skip mount auto-load
    (mockApi.removeIntervenor as jest.Mock).mockResolvedValueOnce(undefined);
    (mockApi.findOccurrencesByReporterId as jest.Mock).mockResolvedValue(
      occurrences,
    );
    const { result } = render();
    await act(async () => {
      await result.current.removeIntervenorFromOccurrence(5, 42);
    });
    expect(mockApi.removeIntervenor).toHaveBeenCalledWith(
      { intervenorId: 5 },
      42,
    );
  });

  it("updates occurrences on an OccurrencesChanged event", async () => {
    const { result } = render();
    await waitFor(() =>
      expect(mockApi.findOccurrencesByReporterId).toHaveBeenCalled(),
    );
    const onMessage = mockListener.mock.calls.at(-1)![1];

    await act(async () => {
      onMessage({ action: "OccurrencesChanged", data: { occurrences } });
      await new Promise((r) => setTimeout(r, 350));
    });

    expect(result.current.occurrence).toEqual(occurrences);
    expect(result.current.loading).toBe(false);
  });

  it("throws when used outside of an OccurrenceProvider", () => {
    expect(() => renderHook(() => useOccurrence())).toThrow(
      /must be used within OccurrenceProvider/,
    );
  });
});
