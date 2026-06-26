import { renderHook, act } from "@testing-library/react-native";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";
import { useTypesListener } from "@hooks/listeners/useTypesListener";

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

describe("movel useTypesListener", () => {
  it("does not connect when disabled or without a user id", () => {
    renderHook(() => useTypesListener(1, jest.fn(), false, DEBOUNCE));
    renderHook(() => useTypesListener(undefined, jest.fn(), true, DEBOUNCE));
    expect(FakeES.instances).toHaveLength(0);
  });

  it("connects to the types SSE endpoint when enabled", () => {
    renderHook(() => useTypesListener(1, jest.fn(), true, DEBOUNCE));
    expect(FakeES.last.url).toBe(`${API_URL}/api/type/listen`);
  });

  it("debounces and forwards a normalized TypesChanged message", async () => {
    const onMessage = jest.fn();
    renderHook(() => useTypesListener(1, onMessage, true, DEBOUNCE));

    const types = [{ id: 1, name: "Fire" }];
    act(() => {
      FakeES.last.emit({ id: 9, action: "TypesChanged", data: types });
    });
    expect(onMessage).not.toHaveBeenCalled();

    await flush();

    expect(onMessage).toHaveBeenCalledWith({
      id: 9,
      action: "TypesChanged",
      data: { action: "TypesChanged", types },
    });
  });

  it("treats a non-array data payload as an empty list", async () => {
    const onMessage = jest.fn();
    renderHook(() => useTypesListener(1, onMessage, true, DEBOUNCE));
    act(() => {
      FakeES.last.emit({ action: "TypesChanged", data: null });
    });
    await flush();
    expect(onMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: { action: "TypesChanged", types: [] } }),
    );
  });

  it("debounces consecutive messages", () => {
    jest.useFakeTimers();

    const onMessage = jest.fn();

    renderHook(() => useTypesListener(1, onMessage, true, 100));

    const types = [{ id: 1, name: "Fire" }];

    act(() => {
      FakeES.last.emit({
        id: 1,
        action: "TypesChanged",
        data: types,
      });

      jest.advanceTimersByTime(50);

      FakeES.last.emit({
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
      FakeES.last.emit({
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

  it("closes the connection on unmount", () => {
    const { unmount } = renderHook(() =>
      useTypesListener(1, jest.fn(), true, DEBOUNCE),
    );
    const es = FakeES.last;
    unmount();
    expect(es.closed).toBe(true);
    expect(es.removedAll).toBe(true);
  });
});
