import { renderHook, act } from "@testing-library/react-native";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";
import { useIntervenorsListener } from "@hooks/listeners/useIntervenorsListener";

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

describe("movel useIntervenorsListener", () => {
  it("does not connect when disabled or without a user id", () => {
    renderHook(() => useIntervenorsListener(1, jest.fn(), false, DEBOUNCE));
    renderHook(() =>
      useIntervenorsListener(undefined, jest.fn(), true, DEBOUNCE),
    );
    expect(FakeES.instances).toHaveLength(0);
  });

  it("connects to the intervenor SSE endpoint when enabled", () => {
    renderHook(() => useIntervenorsListener(1, jest.fn(), true, DEBOUNCE));
    expect(FakeES.last.url).toBe(`${API_URL}/api/intervenor/listen`);
  });

  it("forwards a normalized IntervenorsChanged message", async () => {
    const onMessage = jest.fn();
    renderHook(() => useIntervenorsListener(1, onMessage, true, DEBOUNCE));
    const intervenors = [{ id: 1, name: "John" }];
    act(() => {
      FakeES.last.emit({
        id: 2,
        action: "IntervenorsChanged",
        data: intervenors,
      });
    });
    await flush();
    expect(onMessage).toHaveBeenCalledWith({
      id: 2,
      action: "IntervenorsChanged",
      data: { action: "IntervenorsChanged", intervenors },
    });
  });

  it("debounces consecutive messages", () => {
    jest.useFakeTimers();

    const onMessage = jest.fn();

    renderHook(() => useIntervenorsListener(1, onMessage, true, 100));

    const intervenors = [{ id: 1, name: "John" }];

    act(() => {
      FakeES.last.emit({
        id: 1,
        action: "IntervenorsChanged",
        data: intervenors,
      });

      jest.advanceTimersByTime(50);

      FakeES.last.emit({
        id: 2,
        action: "IntervenorsChanged",
        data: intervenors,
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
        action: "IntervenorsChanged",
        data: intervenors,
      });
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(onMessage).toHaveBeenCalledTimes(1);

    expect(onMessage).toHaveBeenCalledWith({
      id: 3,
      action: "IntervenorsChanged",
      data: {
        action: "IntervenorsChanged",
        intervenors,
      },
    });

    jest.useRealTimers();
  });

  it("closes the connection on unmount", () => {
    const { unmount } = renderHook(() =>
      useIntervenorsListener(1, jest.fn(), true, DEBOUNCE),
    );
    const es = FakeES.last;
    unmount();
    expect(es.closed).toBe(true);
  });
});
