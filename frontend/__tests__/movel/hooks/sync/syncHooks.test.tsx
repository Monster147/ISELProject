import { renderHook } from "@testing-library/react-native";
import { useOfflineSync } from "@hooks/sync/useOfflineSync";
import { useSyncSSE } from "@hooks/sync/useSyncSSE";

describe("movel sync hook guards", () => {
  it("useOfflineSync throws outside of an OfflineSyncProvider", () => {
    expect(() => renderHook(() => useOfflineSync())).toThrow(
      /must be used within OfflineSyncProvider/,
    );
  });

  it("useSyncSSE throws outside of a SyncSSEProvider", () => {
    expect(() => renderHook(() => useSyncSSE())).toThrow(
      /must be used within SyncSSEProvider/,
    );
  });
});
