import { renderHook, act } from "@testing-library/react-native";
import { useReportListener } from "@hooks/listeners/useReportListener";
import {
  FakeEventSource,
  installFakeEventSource,
} from "../../../mocks/FakeEventSource";

let restore: () => void;
beforeEach(() => {
  restore = installFakeEventSource();
});
afterEach(() => restore());

describe("useReportListener", () => {
  it("does not connect when disabled, or without a user / report id", () => {
    renderHook(() => useReportListener(1, "5", jest.fn(), false));
    renderHook(() => useReportListener(undefined, "5", jest.fn(), true));
    renderHook(() => useReportListener(1, undefined, jest.fn(), true));
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("connects to the report-scoped SSE endpoint", () => {
    renderHook(() => useReportListener(1, "8", jest.fn(), true));
    expect(FakeEventSource.last?.url).toBe("/api/report/8/listen");
  });

  it("forwards the parsed message immediately (no debounce)", () => {
    const onMessage = jest.fn();
    renderHook(() => useReportListener(1, "8", onMessage, true));
    const message = { id: 1, action: "ReportStatusChanged", data: 8 };
    act(() => {
      FakeEventSource.last!.emit(message);
    });
    expect(onMessage).toHaveBeenCalledWith(message);
  });

  it("ignores malformed (non-JSON) payloads without throwing", () => {
    const onMessage = jest.fn();
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    renderHook(() => useReportListener(1, "8", onMessage, true));
    act(() => {
      FakeEventSource.last!.emitRaw("not-json{");
    });
    expect(onMessage).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalled(); // the hook logs the parse failure
    spy.mockRestore();
  });

  it("closes the connection on unmount", () => {
    const { unmount } = renderHook(() =>
      useReportListener(1, "8", jest.fn(), true),
    );
    const es = FakeEventSource.last!;
    unmount();
    expect(es.closed).toBe(true);
  });
});
