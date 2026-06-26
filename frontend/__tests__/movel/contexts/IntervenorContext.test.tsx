import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { useAuth } from "@hooks/data/useAuth";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useSyncSSE } from "@hooks/sync/useSyncSSE";
import { intervenorInfoRepo } from "@infrastructure/IntervenorInfoPreferencesRepo";
import { offlineIntervenorQueueRepo } from "@infrastructure/offline/OfflineIntervenorQueueRepo";
import { IntervenorProvider } from "@contexts/IntervenorContext";
import { useIntervenor } from "@hooks/data/useIntervenor";
import { mockIntervenor } from "../../mocks/mockData";

jest.mock("@commons/api/api", () => ({
  api: {
    findAllIntervenors: jest.fn(),
    createIntervenor: jest.fn(),
    updateIntervenor: jest.fn(),
    deleteIntervenorByIdNumber: jest.fn(),
    findIntervenorByIdNumber: jest.fn(),
    findIntervenorByContactInfo: jest.fn(),
    findIntervenorById: jest.fn(),
  },
}));

jest.mock("@hooks/data/useAuth", () => ({ useAuth: jest.fn() }));

jest.mock("@hooks/system/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

jest.mock("@hooks/sync/useSyncSSE", () => ({ useSyncSSE: jest.fn() }));

jest.mock("@infrastructure/IntervenorInfoPreferencesRepo", () => ({
  intervenorInfoRepo: {
    getIntervenorInfo: jest.fn(),
    saveIntervenorInfo: jest.fn(),
  },
}));

jest.mock("@infrastructure/offline/OfflineIntervenorQueueRepo", () => ({
  offlineIntervenorQueueRepo: {
    getQueue: jest.fn(),
    addAction: jest.fn(),
    updateAction: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseNetwork = useNetworkStatus as jest.Mock;
const mockUseSyncSSE = useSyncSSE as jest.Mock;
const repo = intervenorInfoRepo as jest.Mocked<typeof intervenorInfoRepo>;
const queue = offlineIntervenorQueueRepo as jest.Mocked<
  typeof offlineIntervenorQueueRepo
>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntervenorProvider>{children}</IntervenorProvider>
);
const render = () => renderHook(() => useIntervenor(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: 1 } });
  mockUseNetwork.mockReturnValue({ isOnline: true });
  mockUseSyncSSE.mockReturnValue({ lastEvent: undefined });
  (repo.getIntervenorInfo as jest.Mock).mockResolvedValue(null);
  (repo.saveIntervenorInfo as jest.Mock).mockResolvedValue(undefined);
  (queue.getQueue as jest.Mock).mockResolvedValue([]);
  (queue.addAction as jest.Mock).mockResolvedValue(undefined);
  (mockApi.findAllIntervenors as jest.Mock).mockResolvedValue([]);
});

describe("movel IntervenorContext / useIntervenor", () => {
  it("loads from the api and caches when online", async () => {
    (mockApi.findAllIntervenors as jest.Mock).mockResolvedValueOnce([
      mockIntervenor,
    ]);
    const { result } = render();
    await waitFor(() =>
      expect(result.current.intervenor).toEqual([mockIntervenor]),
    );
    expect(repo.saveIntervenorInfo).toHaveBeenCalledWith([mockIntervenor]);
  });

  it("loads cached intervenors when offline", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (repo.getIntervenorInfo as jest.Mock).mockResolvedValue([mockIntervenor]);
    const { result } = render();
    await waitFor(() =>
      expect(result.current.intervenor).toEqual([mockIntervenor]),
    );
    expect(mockApi.findAllIntervenors).not.toHaveBeenCalled();
  });

  it("createIntervenor calls the api directly when online", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    (mockApi.createIntervenor as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = render();
    await act(async () => {
      await result.current.createIntervenor("1", "CC", "n", "c@x.com", "a");
    });
    expect(mockApi.createIntervenor).toHaveBeenCalledWith({
      idNumber: "1",
      idType: "CC",
      name: "n",
      contactInfo: "c@x.com",
      address: "a",
    });
    expect(queue.addAction).not.toHaveBeenCalled();
  });

  it("createIntervenor queues an offline CREATE action when offline", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseNetwork.mockReturnValue({ isOnline: false });
    const { result } = render();
    await act(async () => {
      await result.current.createIntervenor("1", "CC", "n", "c@x.com", "a");
    });
    expect(mockApi.createIntervenor).not.toHaveBeenCalled();
    expect(repo.saveIntervenorInfo).toHaveBeenCalled();
    expect(queue.addAction).toHaveBeenCalledWith(
      "CREATE",
      expect.objectContaining({ idNumber: "1", contactInfo: "c@x.com" }),
    );
    expect(result.current.intervenor).toHaveLength(1);
  });

  it("updateIntervenor calls the api directly when online", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    (mockApi.updateIntervenor as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = render();
    await act(async () => {
      await result.current.updateIntervenor(10, "1", null, "Jane", null, null);
    });
    expect(mockApi.updateIntervenor).toHaveBeenCalledWith(
      {
        idNumber: "1",
        idType: null,
        name: "Jane",
        contactInfo: null,
        address: null,
      },
      10,
    );
  });

  it("delete + finder methods delegate to the api", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    (mockApi.deleteIntervenorByIdNumber as jest.Mock).mockResolvedValueOnce(
      undefined,
    );
    (mockApi.findIntervenorByIdNumber as jest.Mock).mockResolvedValueOnce(
      mockIntervenor,
    );
    (mockApi.findIntervenorByContactInfo as jest.Mock).mockResolvedValueOnce(
      mockIntervenor,
    );
    (mockApi.findIntervenorById as jest.Mock).mockResolvedValueOnce(
      mockIntervenor,
    );
    const { result } = render();
    await result.current.deleteIntervenorByIdNumber("123");
    await expect(result.current.getIntervenorByIdNumber("123")).resolves.toBe(
      mockIntervenor,
    );
    await expect(
      result.current.findIntervenorByContactInfo("c@x.com"),
    ).resolves.toBe(mockIntervenor);
    await expect(result.current.findIntervenorById(10)).resolves.toBe(
      mockIntervenor,
    );
    expect(mockApi.deleteIntervenorByIdNumber).toHaveBeenCalledWith("123");
  });

  it("updates intervenors on an IntervenorsChanged sync event", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseSyncSSE.mockReturnValue({
      lastEvent: { action: "IntervenorsChanged", data: [mockIntervenor] },
    });
    const { result } = render();
    await waitFor(() =>
      expect(result.current.intervenor).toEqual([mockIntervenor]),
    );
    expect(repo.saveIntervenorInfo).toHaveBeenCalledWith([mockIntervenor]);
  });

  it("throws when used outside of an IntervenorProvider", () => {
    expect(() => renderHook(() => useIntervenor())).toThrow(
      /must be used within IntervenorProvider/,
    );
  });
});
