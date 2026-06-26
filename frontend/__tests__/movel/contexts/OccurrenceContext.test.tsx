import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { useAuth } from "@hooks/data/useAuth";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useSyncSSE } from "@hooks/sync/useSyncSSE";
import { occurrenceInfoRepo } from "@infrastructure/OccurrenceInfoPreferencesRepo";
import { intervenorInfoRepo } from "@infrastructure/IntervenorInfoPreferencesRepo";
import { offlineOccurrenceQueueRepo } from "@infrastructure/offline/OfflineOccurrenceQueueRepo";
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

jest.mock("@hooks/sync/useSyncSSE", () => ({ useSyncSSE: jest.fn() }));

jest.mock("@infrastructure/OccurrenceInfoPreferencesRepo", () => ({
  occurrenceInfoRepo: {
    getOccurrenceInfo: jest.fn(),
    saveOccurrenceInfo: jest.fn(),
  },
}));

jest.mock("@infrastructure/IntervenorInfoPreferencesRepo", () => ({
  intervenorInfoRepo: { getIntervenorInfo: jest.fn() },
}));

jest.mock("@infrastructure/offline/OfflineOccurrenceQueueRepo", () => ({
  offlineOccurrenceQueueRepo: { addAction: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseNetwork = useNetworkStatus as jest.Mock;
const mockUseSyncSSE = useSyncSSE as jest.Mock;
const occRepo = occurrenceInfoRepo as jest.Mocked<typeof occurrenceInfoRepo>;
const intRepo = intervenorInfoRepo as jest.Mocked<typeof intervenorInfoRepo>;
const queue = offlineOccurrenceQueueRepo as jest.Mocked<
  typeof offlineOccurrenceQueueRepo
>;

const occurrences = [{ id: 1, intervenors: [] as number[] }] as any;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OccurrenceProvider>{children}</OccurrenceProvider>
);
const render = () => renderHook(() => useOccurrence(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: 1 } });
  mockUseNetwork.mockReturnValue({ isOnline: true });
  mockUseSyncSSE.mockReturnValue({ lastEvent: undefined });
  (occRepo.getOccurrenceInfo as jest.Mock).mockResolvedValue(null);
  (occRepo.saveOccurrenceInfo as jest.Mock).mockResolvedValue(undefined);
  (intRepo.getIntervenorInfo as jest.Mock).mockResolvedValue(null);
  (queue.addAction as jest.Mock).mockResolvedValue(undefined);
  (mockApi.findOccurrencesByReporterId as jest.Mock).mockResolvedValue([]);
});

describe("movel OccurrenceContext / useOccurrence", () => {
  it("lists the reporter's occurrences from the api and caches them when online", async () => {
    (mockApi.findOccurrencesByReporterId as jest.Mock).mockResolvedValueOnce(
      occurrences,
    );
    const { result } = render();
    await waitFor(() => expect(result.current.occurrence).toEqual(occurrences));
    expect(mockApi.findOccurrencesByReporterId).toHaveBeenCalledWith(1);
    expect(occRepo.saveOccurrenceInfo).toHaveBeenCalledWith(occurrences);
  });

  it("loads cached occurrences when offline", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (occRepo.getOccurrenceInfo as jest.Mock).mockResolvedValue(occurrences);
    const { result } = render();
    await waitFor(() => expect(result.current.occurrence).toEqual(occurrences));
    expect(mockApi.findOccurrencesByReporterId).not.toHaveBeenCalled();
  });

  it("getOccurrence delegates to findOccurrenceById", async () => {
    (mockApi.findOccurrenceById as jest.Mock).mockResolvedValueOnce({ id: 9 });
    const { result } = render();
    await waitFor(() =>
      expect(mockApi.findOccurrencesByReporterId).toHaveBeenCalled(),
    );
    await expect(result.current.getOccurrence(9)).resolves.toEqual({ id: 9 });
    expect(mockApi.findOccurrenceById).toHaveBeenCalledWith(9);
  });

  it("addIntervenorToOccurrence posts then reloads the list when online", async () => {
    (mockApi.addIntervenor as jest.Mock).mockResolvedValueOnce(undefined);
    (mockApi.findOccurrencesByReporterId as jest.Mock).mockResolvedValue(
      occurrences,
    );
    const { result } = render();
    await waitFor(() =>
      expect(mockApi.findOccurrencesByReporterId).toHaveBeenCalledTimes(1),
    );
    await act(async () => {
      await result.current.addIntervenorToOccurrence(5, 1);
    });
    expect(mockApi.addIntervenor).toHaveBeenCalledWith({ intervenorId: 5 }, 1);
    expect(mockApi.findOccurrencesByReporterId).toHaveBeenCalledTimes(2);
  });

  it("addIntervenorToOccurrence queues an offline action when offline", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (occRepo.getOccurrenceInfo as jest.Mock).mockResolvedValue(occurrences);
    (intRepo.getIntervenorInfo as jest.Mock).mockResolvedValue([{ id: 5 }]);
    const { result } = render();
    await waitFor(() => expect(result.current.occurrence).toEqual(occurrences));

    await act(async () => {
      await result.current.addIntervenorToOccurrence(5, 1);
    });

    expect(mockApi.addIntervenor).not.toHaveBeenCalled();
    expect(queue.addAction).toHaveBeenCalledWith(
      "ADD_INTERVENOR",
      expect.objectContaining({ occurrenceId: 1 }),
    );
    expect(result.current.occurrence[0].intervenors).toContain(5);
  });

  it("offline addIntervenor throws when the intervenor is not cached", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (occRepo.getOccurrenceInfo as jest.Mock).mockResolvedValue(occurrences);
    (intRepo.getIntervenorInfo as jest.Mock).mockResolvedValue([]);
    const { result } = render();
    await waitFor(() => expect(result.current.occurrence).toEqual(occurrences));

    await expect(
      act(async () => {
        await result.current.addIntervenorToOccurrence(99, 1);
      }),
    ).rejects.toThrow("errorResponse.intervenorNotFound");
  });

  it("updates occurrences on an OccurrencesChanged sync event", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseSyncSSE.mockReturnValue({
      lastEvent: { action: "OccurrencesChanged", data: occurrences },
    });
    const { result } = render();
    await waitFor(() => expect(result.current.occurrence).toEqual(occurrences));
    expect(occRepo.saveOccurrenceInfo).toHaveBeenCalledWith(occurrences);
  });

  it("throws when used outside of an OccurrenceProvider", () => {
    expect(() => renderHook(() => useOccurrence())).toThrow(
      /must be used within OccurrenceProvider/,
    );
  });
});
