import { renderHook, act } from "@testing-library/react-native";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";
import { useOccurrenceListener } from "@hooks/listeners/useOccurrenceListener";

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

describe("movel useOccurrenceListener", () => {
  it("does not connect when disabled, or without a user / occurrence id", () => {
    renderHook(() => useOccurrenceListener(1, "5", jest.fn(), false, DEBOUNCE));
    renderHook(() =>
      useOccurrenceListener(undefined, "5", jest.fn(), true, DEBOUNCE),
    );
    renderHook(() =>
      useOccurrenceListener(1, undefined, jest.fn(), true, DEBOUNCE),
    );
    expect(FakeES.instances).toHaveLength(0);
  });

  it("connects to the occurrence-scoped SSE endpoint", () => {
    renderHook(() => useOccurrenceListener(1, "42", jest.fn(), true, DEBOUNCE));
    expect(FakeES.last.url).toBe(`${API_URL}/api/occurrence/42/listen`);
  });

  it("forwards the parsed message verbatim after the debounce", async () => {
    const onMessage = jest.fn();
    renderHook(() => useOccurrenceListener(1, "42", onMessage, true, DEBOUNCE));
    const message = {
      id: 1,
      action: "IntervenorAdded",
      data: { action: "IntervenorAdded" },
    };
    act(() => {
      FakeES.last.emit(message);
    });
    expect(onMessage).not.toHaveBeenCalled();
    await flush();
    expect(onMessage).toHaveBeenCalledWith(message);
  });

  it("debounces consecutive messages", () => {
    jest.useFakeTimers();

    const onMessage = jest.fn();

    renderHook(() => useOccurrenceListener(1, "42", onMessage, true, 100));

    const message1 = {
      id: 1,
      action: "IntervenorAdded",
      data: { action: "IntervenorAdded" },
    };

    const message2 = {
      id: 2,
      action: "IntervenorAdded",
      data: { action: "IntervenorAdded" },
    };

    const message3 = {
      id: 3,
      action: "IntervenorAdded",
      data: { action: "IntervenorAdded" },
    };

    act(() => {
      FakeES.last.emit(message1);

      jest.advanceTimersByTime(50);

      FakeES.last.emit(message2);
    });

    expect(onMessage).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(99);
    });

    expect(onMessage).not.toHaveBeenCalled();

    act(() => {
      FakeES.last.emit(message3);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith(message3);

    jest.useRealTimers();
  });

  it("closes the connection on unmount", () => {
    const { unmount } = renderHook(() =>
      useOccurrenceListener(1, "42", jest.fn(), true, DEBOUNCE),
    );
    const es = FakeES.last;
    unmount();
    expect(es.closed).toBe(true);
  });
});
