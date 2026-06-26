import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { useAuth } from "@hooks/data/useAuth";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useSyncSSE } from "@hooks/sync/useSyncSSE";
import { evidenceInfoRepo } from "@infrastructure/EvidenceInfoPreferencesRepo";
import { offlineEvidenceQueueRepo } from "@infrastructure/offline/OfflineEvidenceQueueRepo";
import { EvidenceProvider } from "@contexts/EvidenceContext";
import { useEvidence } from "@hooks/data/useEvidence";

jest.mock("@commons/api/api", () => ({
  api: {
    findEvidenceByReporterId: jest.fn(),
    createEvidence: jest.fn(),
    findEvidenceById: jest.fn(),
    findEvidenceByOccurrenceId: jest.fn(),
    downloadEvidence: jest.fn(),
    deleteEvidence: jest.fn(),
    updateEvidence: jest.fn(),
  },
}));

jest.mock("@hooks/data/useAuth", () => ({ useAuth: jest.fn() }));

jest.mock("@hooks/system/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

jest.mock("@hooks/sync/useSyncSSE", () => ({ useSyncSSE: jest.fn() }));

jest.mock("@infrastructure/EvidenceInfoPreferencesRepo", () => ({
  evidenceInfoRepo: {
    getEvidenceInfo: jest.fn(),
    saveEvidenceInfo: jest.fn(),
  },
}));

jest.mock("@infrastructure/offline/OfflineEvidenceQueueRepo", () => ({
  offlineEvidenceQueueRepo: {
    getQueue: jest.fn(),
    addAction: jest.fn(),
    removeAction: jest.fn(),
    updateAction: jest.fn(),
  },
}));

jest.mock("@infrastructure/service/EvidenceCacheService", () => ({
  evidenceCacheService: { cacheFile: jest.fn(), exists: jest.fn() },
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseNetwork = useNetworkStatus as jest.Mock;
const mockUseSyncSSE = useSyncSSE as jest.Mock;
const repo = evidenceInfoRepo as jest.Mocked<typeof evidenceInfoRepo>;
const queue = offlineEvidenceQueueRepo as jest.Mocked<
  typeof offlineEvidenceQueueRepo
>;

const file = { name: "photo.jpg", platform: "web", file: {} } as any;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EvidenceProvider>{children}</EvidenceProvider>
);
const render = () => renderHook(() => useEvidence(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: null }); // skip mount load by default
  mockUseNetwork.mockReturnValue({ isOnline: true });
  mockUseSyncSSE.mockReturnValue({ lastEvent: undefined });
  (repo.getEvidenceInfo as jest.Mock).mockResolvedValue([]);
  (repo.saveEvidenceInfo as jest.Mock).mockResolvedValue(undefined);
  (queue.getQueue as jest.Mock).mockResolvedValue([]);
  (queue.addAction as jest.Mock).mockResolvedValue(undefined);
  (mockApi.findEvidenceByReporterId as jest.Mock).mockResolvedValue([]);
});

describe("movel EvidenceContext / useEvidence", () => {
  it("createEvidence calls the api and reloads when online", async () => {
    (mockApi.createEvidence as jest.Mock).mockResolvedValueOnce({ id: 7 });
    const { result } = render();

    let out: any;
    await act(async () => {
      out = await result.current.createEvidence(
        file,
        "photo",
        "loc",
        "d",
        1,
        42,
      );
    });

    expect(mockApi.createEvidence).toHaveBeenCalledWith(file, {
      type: "photo",
      location: "loc",
      description: "d",
      reporterId: 1,
      occurrenceId: 42,
    });
    expect(out).toEqual({ id: 7 });
  });

  it("createEvidence queues an offline CREATE and returns a temp record", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    const { result } = render();

    let out: any;
    await act(async () => {
      out = await result.current.createEvidence(
        file,
        "photo",
        "loc",
        "d",
        1,
        42,
      );
    });

    expect(mockApi.createEvidence).not.toHaveBeenCalled();
    expect(queue.addAction).toHaveBeenCalledWith(
      "CREATE",
      expect.objectContaining({ occurrenceId: 42, evidenceId: out.id }),
    );
    expect(out.filePath).toBe("occurrences/42/evidences/photo.jpg");
    expect(repo.saveEvidenceInfo).toHaveBeenCalled();
  });

  it("findEvidenceById uses the api when online", async () => {
    (mockApi.findEvidenceById as jest.Mock).mockResolvedValueOnce({ id: 5 });
    const { result } = render();
    await expect(result.current.findEvidenceById(5)).resolves.toEqual({
      id: 5,
    });
  });

  it("findEvidenceById reads from the cache when offline", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (repo.getEvidenceInfo as jest.Mock).mockResolvedValue([{ id: 5 }]);
    const { result } = render();
    await expect(result.current.findEvidenceById(5)).resolves.toEqual({
      id: 5,
    });
    expect(mockApi.findEvidenceById).not.toHaveBeenCalled();
  });

  it("findEvidenceByOccurrenceId filters the local cache when offline", async () => {
    mockUseAuth.mockReturnValue({ user: { id: 1 } });
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (repo.getEvidenceInfo as jest.Mock).mockResolvedValue([
      { id: 1, occurrenceId: 42 },
      { id: 2, occurrenceId: 99 },
    ]);
    const { result } = render();
    await waitFor(async () => {
      const r = await result.current.findEvidenceByOccurrenceId(42);
      expect(r).toEqual([{ id: 1, occurrenceId: 42 }]);
    });
  });

  it("deleteEvidence calls the api and reloads when online", async () => {
    (mockApi.deleteEvidence as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = render();
    await act(async () => {
      await result.current.deleteEvidence(5);
    });
    expect(mockApi.deleteEvidence).toHaveBeenCalledWith(5);
  });

  it("updateEvidence queues an offline UPDATE action", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (queue.getQueue as jest.Mock).mockResolvedValue([]);
    const { result } = render();
    await act(async () => {
      await result.current.updateEvidence(file, 5);
    });
    expect(queue.addAction).toHaveBeenCalledWith("UPDATE", {
      file,
      evidenceId: 5,
    });
  });

  it("updates the evidence list on an EvidenceChanged sync event", async () => {
    const evidences = [{ id: 1 }];
    mockUseSyncSSE.mockReturnValue({
      lastEvent: { action: "EvidenceChanged", data: evidences },
    });
    render();
    await waitFor(() =>
      expect(repo.saveEvidenceInfo).toHaveBeenCalledWith(evidences),
    );
  });

  it("throws when used outside of an EvidenceProvider", () => {
    expect(() => renderHook(() => useEvidence())).toThrow(
      /must be used within EvidenceProvider/,
    );
  });
});
