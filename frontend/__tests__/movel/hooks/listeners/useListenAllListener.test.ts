import { renderHook, act } from "@testing-library/react-native";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";
import { useListenAllListener } from "@hooks/listeners/useListenAllListener";

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

describe("movel useListenAllListener", () => {
  it("does not connect when disabled or without a user id", () => {
    renderHook(() => useListenAllListener(1, jest.fn(), false, DEBOUNCE));
    renderHook(() =>
      useListenAllListener(undefined, jest.fn(), true, DEBOUNCE),
    );
    expect(FakeES.instances).toHaveLength(0);
  });

  it("connects to the aggregate user SSE endpoint when enabled", () => {
    renderHook(() => useListenAllListener(1, jest.fn(), true, DEBOUNCE));
    expect(FakeES.last.url).toBe(`${API_URL}/api/listen/user/1`);
  });

  it("forwards the parsed message verbatim after the debounce", async () => {
    const onMessage = jest.fn();
    renderHook(() => useListenAllListener(1, onMessage, true, DEBOUNCE));
    const message = { action: "TypesChanged", data: [{ id: 1 }] };
    act(() => {
      FakeES.last.emit(message);
    });
    expect(onMessage).not.toHaveBeenCalled();
    await flush();
    expect(onMessage).toHaveBeenCalledWith(message);
  });

  it("debounces per action independently", async () => {
    const onMessage = jest.fn();
    renderHook(() => useListenAllListener(1, onMessage, true, DEBOUNCE));
    act(() => {
      FakeES.last.emit({ action: "TypesChanged", data: [] });
      FakeES.last.emit({ action: "DocumentsChanged", data: [] });
    });
    await flush();

    expect(onMessage).toHaveBeenCalledTimes(2);
  });

  it("debounces consecutive messages with the same action", () => {
    jest.useFakeTimers();

    const onMessage = jest.fn();

    renderHook(() => useListenAllListener(1, onMessage, true, 100));

    act(() => {
      FakeES.last.emit({
        action: "TypesChanged",
        data: [{ id: 1 }],
      });

      jest.advanceTimersByTime(50);

      FakeES.last.emit({
        action: "TypesChanged",
        data: [{ id: 2 }],
      });
    });

    expect(onMessage).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(99);
    });

    expect(onMessage).not.toHaveBeenCalled();

    act(() => {
      FakeES.last.emit({
        action: "TypesChanged",
        data: [{ id: 3 }],
      });
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(onMessage).toHaveBeenCalledTimes(1);

    expect(onMessage).toHaveBeenCalledWith({
      action: "TypesChanged",
      data: [{ id: 3 }],
    });

    jest.useRealTimers();
  });

  it("closes the connection on unmount", () => {
    const { unmount } = renderHook(() =>
      useListenAllListener(1, jest.fn(), true, DEBOUNCE),
    );
    const es = FakeES.last;
    unmount();
    expect(es.closed).toBe(true);
  });
});
