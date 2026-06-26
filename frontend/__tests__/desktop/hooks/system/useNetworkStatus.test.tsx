import { renderHook, act } from "@testing-library/react-native";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";

describe("desktop useNetworkStatus", () => {
  it("initialises from navigator.onLine", () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(navigator.onLine);
  });

  it("becomes offline when the window fires an offline event", () => {
    const { result } = renderHook(() => useNetworkStatus());
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current.isOnline).toBe(false);
  });

  it("becomes online again when the window fires an online event", () => {
    const { result } = renderHook(() => useNetworkStatus());
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current.isOnline).toBe(true);
  });
});
