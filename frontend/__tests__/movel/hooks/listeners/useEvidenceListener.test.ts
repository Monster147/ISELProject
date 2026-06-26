import { renderHook, act } from "@testing-library/react-native";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";
import { useEvidenceListener } from "@hooks/listeners/useEvidenceListener";

const FakeES = EventSource as unknown as {
  last: any;
  reset: () => void;
  instances: any[];
};
const DEBOUNCE = 10;
const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, DEBOUNCE + 20));
  });

beforeEach(() => FakeES.reset());

describe("movel useEvidenceListener", () => {
  it("does not connect when disabled or without a user id", () => {
    renderHook(() => useEvidenceListener(1, jest.fn(), false, DEBOUNCE));
    renderHook(() => useEvidenceListener(undefined, jest.fn(), true, DEBOUNCE));
    expect(FakeES.instances).toHaveLength(0);
  });

  it("connects to the user-scoped evidence SSE endpoint", () => {
    renderHook(() => useEvidenceListener(7, jest.fn(), true, DEBOUNCE));
    expect(FakeES.last.url).toBe(`${API_URL}/api/evidence/7/listen`);
  });

  it("forwards a normalized EvidenceChanged message", async () => {
    const onMessage = jest.fn();
    renderHook(() => useEvidenceListener(7, onMessage, true, DEBOUNCE));
    const evidences = [{ id: 1 }];
    act(() => {
      FakeES.last.emit({ id: 5, action: "EvidenceChanged", data: evidences });
    });
    await flush();
    expect(onMessage).toHaveBeenCalledWith({
      id: 5,
      action: "EvidenceChanged",
      data: { action: "EvidenceChanged", evidences },
    });
  });

  it("debounces consecutive messages", () => {
    jest.useFakeTimers();

    const onMessage = jest.fn();

    renderHook(() => useEvidenceListener(7, onMessage, true, 100));

    const evidences = [{ id: 1 }];

    act(() => {
      FakeES.last.emit({
        id: 1,
        action: "EvidenceChanged",
        data: evidences,
      });

      jest.advanceTimersByTime(50);

      FakeES.last.emit({
        id: 2,
        action: "EvidenceChanged",
        data: evidences,
      });
    });

    expect(onMessage).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(99);
    });

    expect(onMessage).not.toHaveBeenCalled();

    act(() => {
      FakeES.last.emit({
        id: 3,
        action: "EvidenceChanged",
        data: evidences,
      });
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(onMessage).toHaveBeenCalledTimes(1);

    expect(onMessage).toHaveBeenCalledWith({
      id: 3,
      action: "EvidenceChanged",
      data: {
        action: "EvidenceChanged",
        evidences,
      },
    });

    jest.useRealTimers();
  });

  it("closes the connection on unmount", () => {
    const { unmount } = renderHook(() =>
      useEvidenceListener(7, jest.fn(), true, DEBOUNCE),
    );
    const es = FakeES.last;
    unmount();
    expect(es.closed).toBe(true);
  });
});
