import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { useAuth } from "@hooks/data/useAuth";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useTypesListener } from "@hooks/listeners/useTypesListener";
import { TypeProvider } from "@contexts/TypeContext";
import { useType } from "@hooks/data/useType";

jest.mock("@commons/api/api", () => ({
  api: { findAllTypes: jest.fn() },
}));

jest.mock("@hooks/data/useAuth", () => ({ useAuth: jest.fn() }));

jest.mock("@hooks/system/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

jest.mock("@hooks/listeners/useTypesListener", () => ({
  useTypesListener: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseNetwork = useNetworkStatus as jest.Mock;
const mockListener = useTypesListener as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TypeProvider>{children}</TypeProvider>
);
const render = () => renderHook(() => useType(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: 1 } });
  mockUseNetwork.mockReturnValue({ isOnline: true });
  (mockApi.findAllTypes as jest.Mock).mockResolvedValue([]);
});

describe("TypeContext / useType", () => {
  it("loads all types on mount when authenticated and online", async () => {
    const types = [{ id: 1, name: "Fire" }];
    (mockApi.findAllTypes as jest.Mock).mockResolvedValueOnce(types);

    const { result } = render();

    await waitFor(() => expect(result.current.type).toEqual(types));
    expect(mockApi.findAllTypes).toHaveBeenCalledTimes(1);
  });

  it("does not load when offline", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    render();
    expect(mockApi.findAllTypes).not.toHaveBeenCalled();
  });

  it("does not load when there is no user", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    render();
    expect(mockApi.findAllTypes).not.toHaveBeenCalled();
  });

  it("subscribes the listener with the user id and online flag", async () => {
    const { result } = render();
    await waitFor(() => expect(mockApi.findAllTypes).toHaveBeenCalled());
    expect(mockListener).toHaveBeenCalled();
    const [userId, , enabled] = mockListener.mock.calls.at(-1)!;
    expect(userId).toBe(1);
    expect(enabled).toBe(true);
    expect(result.current).toBeDefined();
  });

  it("updates the types when the listener reports a TypesChanged event", async () => {
    const { result } = render();
    await waitFor(() => expect(mockApi.findAllTypes).toHaveBeenCalled());

    const onMessage = mockListener.mock.calls.at(-1)![1];
    const newTypes = [{ id: 9, name: "Flood" }];

    await act(async () => {
      onMessage({ action: "TypesChanged", data: { types: newTypes } });
      // let the loading-flag timeout (300ms) settle inside act
      await new Promise((r) => setTimeout(r, 350));
    });

    expect(result.current.type).toEqual(newTypes);
    expect(result.current.loading).toBe(false);
  });

  it("throws when used outside of a TypeProvider", () => {
    expect(() => renderHook(() => useType())).toThrow(
      /must be used within TypeProvider/,
    );
  });
});
