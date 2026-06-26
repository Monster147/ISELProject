import { renderHook, act } from "@testing-library/react-native";
import { useOccurrenceListener } from "@hooks/listeners/useOccurrenceListener";
import {
  FakeEventSource,
  installFakeEventSource,
} from "../../../mocks/FakeEventSource";

const DEBOUNCE = 10;
const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, DEBOUNCE + 20));
  });

let restore: () => void;
beforeEach(() => {
  restore = installFakeEventSource();
});
afterEach(() => restore());

describe("useOccurrenceListener", () => {
  it("does not connect when disabled, or without a user / occurrence id", () => {
    renderHook(() => useOccurrenceListener(1, "5", jest.fn(), false, DEBOUNCE));
    renderHook(() =>
      useOccurrenceListener(undefined, "5", jest.fn(), true, DEBOUNCE),
    );
    renderHook(() =>
      useOccurrenceListener(1, undefined, jest.fn(), true, DEBOUNCE),
    );
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("connects to the occurrence-scoped SSE endpoint", () => {
    renderHook(() => useOccurrenceListener(1, "42", jest.fn(), true, DEBOUNCE));
    expect(FakeEventSource.last?.url).toBe("/api/occurrence/42/listen");
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
      FakeEventSource.last!.emit(message);
    });
    expect(onMessage).not.toHaveBeenCalled();
    await flush();
    expect(onMessage).toHaveBeenCalledWith(message);
  });

  it("debounces consecutive messages", () => {
    jest.useFakeTimers();

    const onMessage = jest.fn();

    renderHook(() => useOccurrenceListener(1, "42", onMessage, true, 100));

    act(() => {
      FakeEventSource.last!.emit({
        id: 1,
        action: "IntervenorAdded",
        data: {
          action: "IntervenorAdded",
        },
      });

      jest.advanceTimersByTime(50);

      FakeEventSource.last!.emit({
        id: 2,
        action: "IntervenorAdded",
        data: {
          action: "IntervenorAdded",
        },
      });
    });

    expect(onMessage).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(99);
    });

    expect(onMessage).not.toHaveBeenCalled();

    const message = {
      id: 3,
      action: "IntervenorAdded",
      data: {
        action: "IntervenorAdded",
      },
    };

    act(() => {
      FakeEventSource.last!.emit(message);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith(message);

    jest.useRealTimers();
  });

  it("closes the connection on unmount", () => {
    const { unmount } = renderHook(() =>
      useOccurrenceListener(1, "42", jest.fn(), true, DEBOUNCE),
    );
    const es = FakeEventSource.last!;
    unmount();
    expect(es.closed).toBe(true);
  });
});
