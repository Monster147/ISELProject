import { renderHook, act } from "@testing-library/react-native";
import { useOccurrencesListener } from "@hooks/listeners/useOccurrencesListener";
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

describe("useOccurrencesListener", () => {
  it("does not connect when disabled or without a user id", () => {
    renderHook(() => useOccurrencesListener(1, jest.fn(), false, DEBOUNCE));
    renderHook(() =>
      useOccurrencesListener(undefined, jest.fn(), true, DEBOUNCE),
    );
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("connects to the user-scoped occurrences SSE endpoint", () => {
    renderHook(() => useOccurrencesListener(1, jest.fn(), true, DEBOUNCE));
    expect(FakeEventSource.last?.url).toBe("/api/occurrence/listen/user/1");
  });

  it("forwards a normalized OccurrencesChanged message", async () => {
    const onMessage = jest.fn();
    renderHook(() => useOccurrencesListener(1, onMessage, true, DEBOUNCE));
    const occurrences = [{ id: 1 }, { id: 2 }];
    act(() => {
      FakeEventSource.last!.emit({
        id: 4,
        action: "OccurrencesChanged",
        data: occurrences,
      });
    });
    await flush();
    expect(onMessage).toHaveBeenCalledWith({
      id: 4,
      action: "OccurrencesChanged",
      data: { action: "OccurrencesChanged", occurrences },
    });
  });

  it("debounces consecutive messages", () => {
    jest.useFakeTimers();

    const onMessage = jest.fn();

    renderHook(() => useOccurrencesListener(1, onMessage, true, 100));

    const occurrences = [{ id: 1 }, { id: 2 }];

    act(() => {
      FakeEventSource.last!.emit({
        id: 1,
        action: "OccurrencesChanged",
        data: occurrences,
      });

      jest.advanceTimersByTime(50);

      FakeEventSource.last!.emit({
        id: 2,
        action: "OccurrencesChanged",
        data: occurrences,
      });
    });

    expect(onMessage).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(99);
    });

    expect(onMessage).not.toHaveBeenCalled();

    act(() => {
      FakeEventSource.last!.emit({
        id: 3,
        action: "OccurrencesChanged",
        data: occurrences,
      });
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(onMessage).toHaveBeenCalledTimes(1);

    expect(onMessage).toHaveBeenCalledWith({
      id: 3,
      action: "OccurrencesChanged",
      data: {
        action: "OccurrencesChanged",
        occurrences,
      },
    });

    jest.useRealTimers();
  });

  it("closes the connection on unmount", () => {
    const { unmount } = renderHook(() =>
      useOccurrencesListener(1, jest.fn(), true, DEBOUNCE),
    );
    const es = FakeEventSource.last!;
    unmount();
    expect(es.closed).toBe(true);
  });
});
