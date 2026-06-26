import { renderHook, act } from "@testing-library/react-native";
import NetInfo from "@react-native-community/netinfo";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";

const NetInfoMock = NetInfo as unknown as {
  __emit: (state: any) => void;
  __unsubscribe: jest.Mock;
  __reset: () => void;
  addEventListener: jest.Mock;
};

beforeEach(() => NetInfoMock.__reset());

describe("movel useNetworkStatus", () => {
  it("subscribes to NetInfo on mount", () => {
    renderHook(() => useNetworkStatus());
    expect(NetInfoMock.addEventListener).toHaveBeenCalledTimes(1);
  });

  it("starts with an unknown (null) connectivity state", () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBeNull();
  });

  it("is online when connected and the internet is reachable", () => {
    const { result } = renderHook(() => useNetworkStatus());
    act(() => {
      NetInfoMock.__emit({ isConnected: true, isInternetReachable: true });
    });
    expect(result.current.isOnline).toBe(true);
  });

  it("is offline when not connected", () => {
    const { result } = renderHook(() => useNetworkStatus());
    act(() => {
      NetInfoMock.__emit({ isConnected: false, isInternetReachable: false });
    });
    expect(result.current.isOnline).toBe(false);
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() => useNetworkStatus());
    unmount();
    expect(NetInfoMock.__unsubscribe).toHaveBeenCalledTimes(1);
  });
});
