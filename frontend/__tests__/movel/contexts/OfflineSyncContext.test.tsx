import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { offlineIntervenorQueueRepo } from "@infrastructure/offline/OfflineIntervenorQueueRepo";
import { offlineOccurrenceQueueRepo } from "@infrastructure/offline/OfflineOccurrenceQueueRepo";
import { offlineEvidenceQueueRepo } from "@infrastructure/offline/OfflineEvidenceQueueRepo";
import { OfflineSyncProvider } from "@contexts/OfflineSyncContext";
import { useOfflineSync } from "@hooks/sync/useOfflineSync";

jest.mock("@commons/api/api", () => ({
  api: {
    createIntervenor: jest.fn(),
    updateIntervenor: jest.fn(),
    findIntervenorByIdNumber: jest.fn(),
    addIntervenor: jest.fn(),
    removeIntervenor: jest.fn(),
    createEvidence: jest.fn(),
    deleteEvidence: jest.fn(),
    updateEvidence: jest.fn(),
  },
}));

jest.mock("@hooks/system/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

jest.mock("@infrastructure/offline/OfflineIntervenorQueueRepo", () => ({
  offlineIntervenorQueueRepo: {
    getQueue: jest.fn(),
    removeAction: jest.fn(),
    updateAction: jest.fn(),
  },
}));

jest.mock("@infrastructure/offline/OfflineOccurrenceQueueRepo", () => ({
  offlineOccurrenceQueueRepo: {
    getQueue: jest.fn(),
    removeAction: jest.fn(),
    updateAction: jest.fn(),
  },
}));

jest.mock("@infrastructure/offline/OfflineEvidenceQueueRepo", () => ({
  offlineEvidenceQueueRepo: {
    getQueue: jest.fn(),
    removeAction: jest.fn(),
    updateAction: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockUseNetwork = useNetworkStatus as jest.Mock;

function wireQueue(repo: any) {
  let items: any[] = [];
  repo.getQueue.mockImplementation(async () => [...items]);
  repo.removeAction.mockImplementation(async (id: string) => {
    items = items.filter((a) => a.id !== id);
  });
  repo.updateAction.mockImplementation(async (id: string, updated: any) => {
    items = items.map((a) => (a.id === id ? updated : a));
  });
  return (next: any[]) => {
    items = next;
  };
}

let setIntervenorQueue: (n: any[]) => void;
let setOccurrenceQueue: (n: any[]) => void;
let setEvidenceQueue: (n: any[]) => void;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OfflineSyncProvider>{children}</OfflineSyncProvider>
);
const render = () => renderHook(() => useOfflineSync(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  setIntervenorQueue = wireQueue(offlineIntervenorQueueRepo);
  setOccurrenceQueue = wireQueue(offlineOccurrenceQueueRepo);
  setEvidenceQueue = wireQueue(offlineEvidenceQueueRepo);
  mockUseNetwork.mockReturnValue({ isOnline: false });
});

describe("movel OfflineSyncContext / useOfflineSync", () => {
  it("exposes syncAllOfflineQueues", () => {
    const { result } = render();
    expect(typeof result.current.syncAllOfflineQueues).toBe("function");
  });

  it("does nothing when all queues are empty", async () => {
    const { result } = render();
    await act(async () => {
      await result.current.syncAllOfflineQueues();
    });
    expect(mockApi.createIntervenor).not.toHaveBeenCalled();
    expect(mockApi.createEvidence).not.toHaveBeenCalled();
  });

  it("flushes a queued CREATE intervenor and removes it from the queue", async () => {
    setIntervenorQueue([
      {
        id: "a1",
        type: "CREATE",
        retries: 0,
        maxRetries: 5,
        payload: {
          idNumber: "1",
          idType: "CC",
          name: "John",
          contactInfo: "c@x.com",
          address: "Rua 1",
        },
      },
    ]);
    (mockApi.createIntervenor as jest.Mock).mockResolvedValue(undefined);

    const { result } = render();
    await act(async () => {
      await result.current.syncAllOfflineQueues();
    });

    expect(mockApi.createIntervenor).toHaveBeenCalledWith({
      idNumber: "1",
      idType: "CC",
      name: "John",
      contactInfo: "c@x.com",
      address: "Rua 1",
    });
    expect(offlineIntervenorQueueRepo.removeAction).toHaveBeenCalledWith("a1");
  });

  it("drops actions that have exhausted their retries without calling the api", async () => {
    setIntervenorQueue([
      { id: "a2", type: "CREATE", retries: 5, maxRetries: 5, payload: {} },
    ]);

    const { result } = render();
    await act(async () => {
      await result.current.syncAllOfflineQueues();
    });

    expect(mockApi.createIntervenor).not.toHaveBeenCalled();
    expect(offlineIntervenorQueueRepo.removeAction).toHaveBeenCalledWith("a2");
  });

  it("flushes a queued evidence DELETE", async () => {
    setEvidenceQueue([
      {
        id: "e1",
        type: "DELETE",
        retries: 0,
        maxRetries: 5,
        payload: { evidenceId: 7 },
      },
    ]);
    (mockApi.deleteEvidence as jest.Mock).mockResolvedValue(undefined);

    const { result } = render();
    await act(async () => {
      await result.current.syncAllOfflineQueues();
    });

    expect(mockApi.deleteEvidence).toHaveBeenCalledWith(7);
    expect(offlineEvidenceQueueRepo.removeAction).toHaveBeenCalledWith("e1");
  });

  it("flushes a queued ADD_INTERVENOR occurrence action", async () => {
    setOccurrenceQueue([
      {
        id: "o1",
        type: "ADD_INTERVENOR",
        retries: 0,
        maxRetries: 5,
        payload: { intervenor: { idNumber: "123" }, occurrenceId: 1 },
      },
    ]);
    (mockApi.findIntervenorByIdNumber as jest.Mock).mockResolvedValue({
      id: 5,
    });
    (mockApi.addIntervenor as jest.Mock).mockResolvedValue(undefined);

    const { result } = render();
    await act(async () => {
      await result.current.syncAllOfflineQueues();
    });

    expect(mockApi.findIntervenorByIdNumber).toHaveBeenCalledWith("123");
    expect(mockApi.addIntervenor).toHaveBeenCalledWith({ intervenorId: 5 }, 1);
    expect(offlineOccurrenceQueueRepo.removeAction).toHaveBeenCalledWith("o1");
    await expect(offlineOccurrenceQueueRepo.getQueue()).resolves.toEqual([]);
  });

  it("flushes a queued REMOVE_INTERVENOR occurrence action", async () => {
    setOccurrenceQueue([
      {
        id: "o2",
        type: "REMOVE_INTERVENOR",
        retries: 0,
        maxRetries: 5,
        payload: { intervenor: { idNumber: "123" }, occurrenceId: 1 },
      },
    ]);
    (mockApi.findIntervenorByIdNumber as jest.Mock).mockResolvedValue({
      id: 5,
    });
    (mockApi.removeIntervenor as jest.Mock).mockResolvedValue(undefined);

    const { result } = render();
    await act(async () => {
      await result.current.syncAllOfflineQueues();
    });

    expect(mockApi.findIntervenorByIdNumber).toHaveBeenCalledWith("123");
    expect(mockApi.removeIntervenor).toHaveBeenCalledWith(
      { intervenorId: 5 },
      1,
    );
    expect(offlineOccurrenceQueueRepo.removeAction).toHaveBeenCalledWith("o2");
  });

  it("drops an occurrence action that has exhausted its retries", async () => {
    setOccurrenceQueue([
      {
        id: "o3",
        type: "ADD_INTERVENOR",
        retries: 5,
        maxRetries: 5,
        payload: { intervenor: { idNumber: "123" }, occurrenceId: 1 },
      },
    ]);

    const { result } = render();
    await act(async () => {
      await result.current.syncAllOfflineQueues();
    });

    expect(mockApi.addIntervenor).not.toHaveBeenCalled();
    expect(offlineOccurrenceQueueRepo.removeAction).toHaveBeenCalledWith("o3");
  });

  it("keeps the not-yet-sent requests in the queue when connectivity drops mid-flush", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    setOccurrenceQueue([
      {
        id: "o1",
        type: "ADD_INTERVENOR",
        retries: 0,
        maxRetries: 5,
        payload: { intervenor: { idNumber: "111" }, occurrenceId: 1 },
      },
      {
        id: "o2",
        type: "ADD_INTERVENOR",
        retries: 0,
        maxRetries: 5,
        payload: { intervenor: { idNumber: "222" }, occurrenceId: 2 },
      },
      {
        id: "o3",
        type: "ADD_INTERVENOR",
        retries: 0,
        maxRetries: 5,
        payload: { intervenor: { idNumber: "333" }, occurrenceId: 3 },
      },
    ]);
    (mockApi.findIntervenorByIdNumber as jest.Mock).mockResolvedValue({
      id: 5,
    });
    (mockApi.addIntervenor as jest.Mock)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Network request failed"));

    const { result } = render();
    await act(async () => {
      await result.current.syncAllOfflineQueues();
    });

    expect(mockApi.addIntervenor).toHaveBeenCalledTimes(2);
    expect(offlineOccurrenceQueueRepo.removeAction).toHaveBeenCalledWith("o1");
    expect(offlineOccurrenceQueueRepo.removeAction).not.toHaveBeenCalledWith(
      "o2",
    );
    expect(offlineOccurrenceQueueRepo.removeAction).not.toHaveBeenCalledWith(
      "o3",
    );
    const remaining = await offlineOccurrenceQueueRepo.getQueue();
    expect(remaining.map((a) => a.id)).toEqual(["o2", "o3"]);

    (mockApi.addIntervenor as jest.Mock).mockResolvedValue(undefined);
    await act(async () => {
      await result.current.syncAllOfflineQueues();
    });

    expect(offlineOccurrenceQueueRepo.removeAction).toHaveBeenCalledWith("o2");
    expect(offlineOccurrenceQueueRepo.removeAction).toHaveBeenCalledWith("o3");
    expect(mockApi.addIntervenor).toHaveBeenLastCalledWith(
      { intervenorId: 5 },
      3,
    );
    await expect(offlineOccurrenceQueueRepo.getQueue()).resolves.toEqual([]);

    errorSpy.mockRestore();
  });

  it("automatically syncs on mount when online", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: true });
    setIntervenorQueue([
      {
        id: "a3",
        type: "CREATE",
        retries: 0,
        maxRetries: 5,
        payload: { idNumber: "1" },
      },
    ]);
    (mockApi.createIntervenor as jest.Mock).mockResolvedValue(undefined);

    render();
    await waitFor(() => expect(mockApi.createIntervenor).toHaveBeenCalled());
  });

  it("throws when used outside of an OfflineSyncProvider", () => {
    expect(() => renderHook(() => useOfflineSync())).toThrow(
      /must be used within OfflineSyncProvider/,
    );
  });
});
