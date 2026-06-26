import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { useListenAllListener } from "@hooks/listeners/useListenAllListener";
import { useAuth } from "@hooks/data/useAuth";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { SyncSSEProvider } from "@contexts/SyncSSEContext";
import { useSyncSSE } from "@hooks/sync/useSyncSSE";

jest.mock("@hooks/listeners/useListenAllListener", () => ({
  useListenAllListener: jest.fn(),
}));

jest.mock("@hooks/data/useAuth", () => ({ useAuth: jest.fn() }));

jest.mock("@hooks/system/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

const mockListener = useListenAllListener as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;
const mockUseNetwork = useNetworkStatus as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SyncSSEProvider>{children}</SyncSSEProvider>
);
const render = () => renderHook(() => useSyncSSE(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: 1 } });
  mockUseNetwork.mockReturnValue({ isOnline: true });
});

describe("movel SyncSSEContext / useSyncSSE", () => {
  it("subscribes the aggregate listener with the user id and online flag", () => {
    render();
    const [userId, , enabled] = mockListener.mock.calls.at(-1)!;
    expect(userId).toBe(1);
    expect(enabled).toBe(true);
  });

  it("starts with no lastEvent", () => {
    const { result } = render();
    expect(result.current.lastEvent).toBeUndefined();
  });

  it("exposes the last event received from the listener", async () => {
    const { result } = render();
    const onMessage = mockListener.mock.calls.at(-1)![1];
    const message = { action: "TypesChanged", data: [{ id: 1 }] };

    await act(async () => {
      await onMessage(message);
    });

    expect(result.current.lastEvent).toEqual(message);
  });

  it("throws when used outside of a SyncSSEProvider", () => {
    expect(() => renderHook(() => useSyncSSE())).toThrow(
      /must be used within SyncSSEProvider/,
    );
  });
});
