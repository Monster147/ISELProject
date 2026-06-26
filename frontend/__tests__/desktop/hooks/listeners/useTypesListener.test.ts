import { renderHook, act } from "@testing-library/react-native";
import { useTypesListener } from "@hooks/listeners/useTypesListener";
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

describe("useTypesListener", () => {
  it("does not open a connection when disabled", () => {
    renderHook(() => useTypesListener(1, jest.fn(), false, DEBOUNCE));
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("does not open a connection without a user id", () => {
    renderHook(() => useTypesListener(undefined, jest.fn(), true, DEBOUNCE));
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("connects to the types SSE endpoint when enabled", () => {
    renderHook(() => useTypesListener(1, jest.fn(), true, DEBOUNCE));
    expect(FakeEventSource.last?.url).toBe("/api/type/listen");
  });

  it("debounces and forwards a normalized TypesChanged message", async () => {
    const onMessage = jest.fn();
    renderHook(() => useTypesListener(1, onMessage, true, DEBOUNCE));

    const types = [{ id: 1, name: "Fire" }];
    act(() => {
      FakeEventSource.last!.emit({
        id: 9,
        action: "TypesChanged",
        data: types,
      });
    });
    expect(onMessage).not.toHaveBeenCalled(); // waits for the debounce window

    await flush();

    expect(onMessage).toHaveBeenCalledWith({
      id: 9,
      action: "TypesChanged",
      data: { action: "TypesChanged", types },
    });
  });

  it("debounces consecutive messages", () => {
    jest.useFakeTimers();

    const onMessage = jest.fn();

    renderHook(() => useTypesListener(1, onMessage, true, 100));

    const types = [{ id: 1, name: "Fire" }];

    act(() => {
      FakeEventSource.last!.emit({
        id: 1,
        action: "TypesChanged",
        data: types,
      });

      jest.advanceTimersByTime(50);

      FakeEventSource.last!.emit({
        id: 2,
        action: "TypesChanged",
        data: types,
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
        action: "TypesChanged",
        data: types,
      });
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(onMessage).toHaveBeenCalledTimes(1);

    expect(onMessage).toHaveBeenCalledWith({
      id: 3,
      action: "TypesChanged",
      data: {
        action: "TypesChanged",
        types,
      },
    });

    jest.useRealTimers();
  });

  it("treats a non-array data payload as an empty list", async () => {
    const onMessage = jest.fn();
    renderHook(() => useTypesListener(1, onMessage, true, DEBOUNCE));
    act(() => {
      FakeEventSource.last!.emit({ action: "TypesChanged", data: null });
    });
    await flush();
    expect(onMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: { action: "TypesChanged", types: [] } }),
    );
  });

  it("closes the connection on unmount", () => {
    const { unmount } = renderHook(() =>
      useTypesListener(1, jest.fn(), true, DEBOUNCE),
    );
    const es = FakeEventSource.last!;
    unmount();
    expect(es.closed).toBe(true);
  });
});
