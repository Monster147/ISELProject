import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { useAuth } from "@hooks/data/useAuth";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useSyncSSE } from "@hooks/sync/useSyncSSE";
import { typeInfoRepo } from "@infrastructure/TypeInfopreferencesRepo";
import { TypeProvider } from "@contexts/TypeContext";
import { useType } from "@hooks/data/useType";

jest.mock("@commons/api/api", () => ({ api: { findAllTypes: jest.fn() } }));

jest.mock("@hooks/data/useAuth", () => ({ useAuth: jest.fn() }));

jest.mock("@hooks/system/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

jest.mock("@hooks/sync/useSyncSSE", () => ({ useSyncSSE: jest.fn() }));

jest.mock("@infrastructure/TypeInfopreferencesRepo", () => ({
  typeInfoRepo: {
    getTypeInfo: jest.fn(),
    saveTypeInfo: jest.fn(),
    clearTypeInfo: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseNetwork = useNetworkStatus as jest.Mock;
const mockUseSyncSSE = useSyncSSE as jest.Mock;
const repo = typeInfoRepo as jest.Mocked<typeof typeInfoRepo>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TypeProvider>{children}</TypeProvider>
);
const render = () => renderHook(() => useType(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: 1 } });
  mockUseNetwork.mockReturnValue({ isOnline: true });
  mockUseSyncSSE.mockReturnValue({ lastEvent: undefined });
  (repo.getTypeInfo as jest.Mock).mockResolvedValue(null);
  (repo.saveTypeInfo as jest.Mock).mockResolvedValue(undefined);
  (mockApi.findAllTypes as jest.Mock).mockResolvedValue([]);
});

describe("movel TypeContext / useType", () => {
  it("fetches from the api and caches it when online", async () => {
    const types = [{ id: 1, name: "Fire" }];
    (mockApi.findAllTypes as jest.Mock).mockResolvedValueOnce(types);

    const { result } = render();

    await waitFor(() => expect(result.current.type).toEqual(types));
    expect(repo.saveTypeInfo).toHaveBeenCalledWith(types);
  });

  it("loads the cached types when offline", async () => {
    const cached = [{ id: 2, name: "Cached" }];
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (repo.getTypeInfo as jest.Mock).mockResolvedValue(cached);

    const { result } = render();

    await waitFor(() => expect(result.current.type).toEqual(cached));
    expect(mockApi.findAllTypes).not.toHaveBeenCalled();
  });

  it("falls back to the cache when the api call fails", async () => {
    const cached = [{ id: 3, name: "Fallback" }];
    (mockApi.findAllTypes as jest.Mock).mockRejectedValueOnce(
      new Error("offline"),
    );
    (repo.getTypeInfo as jest.Mock).mockResolvedValue(cached);

    const { result } = render();

    await waitFor(() => expect(result.current.type).toEqual(cached));
  });

  it("updates and caches types on a TypesChanged sync event", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const newTypes = [{ id: 9, name: "Flood" }];
    mockUseSyncSSE.mockReturnValue({
      lastEvent: { action: "TypesChanged", data: newTypes },
    });

    const { result } = render();

    await waitFor(() => expect(result.current.type).toEqual(newTypes));
    expect(repo.saveTypeInfo).toHaveBeenCalledWith(newTypes);
  });

  it("throws when used outside of a TypeProvider", () => {
    expect(() => renderHook(() => useType())).toThrow(
      /must be used within TypeProvider/,
    );
  });
});
