import { renderHook, act } from "@testing-library/react-native";
import EventSource from "react-native-sse";
import { API_URL } from "@commons/constants/apiurl";
import { useDocumentsListener } from "@hooks/listeners/useDocumentsListener";

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

describe("movel useDocumentsListener", () => {
  it("does not connect when disabled or without a user id", () => {
    renderHook(() => useDocumentsListener(1, jest.fn(), false, DEBOUNCE));
    renderHook(() =>
      useDocumentsListener(undefined, jest.fn(), true, DEBOUNCE),
    );
    expect(FakeES.instances).toHaveLength(0);
  });

  it("connects to the documents SSE endpoint when enabled", () => {
    renderHook(() => useDocumentsListener(1, jest.fn(), true, DEBOUNCE));
    expect(FakeES.last.url).toBe(`${API_URL}/api/documents/listen`);
  });

  it("forwards a normalized DocumentsChanged message", async () => {
    const onMessage = jest.fn();
    renderHook(() => useDocumentsListener(1, onMessage, true, DEBOUNCE));
    const documents = [{ id: 1, name: "a.pdf" }];
    act(() => {
      FakeES.last.emit({ id: 3, action: "DocumentsChanged", data: documents });
    });
    await flush();
    expect(onMessage).toHaveBeenCalledWith({
      id: 3,
      action: "DocumentsChanged",
      data: { action: "DocumentsChanged", documents },
    });
  });

  it("debounces consecutive messages", () => {
    jest.useFakeTimers();

    const onMessage = jest.fn();

    renderHook(() => useDocumentsListener(1, onMessage, true, 100));

    const documents = [{ id: 1, name: "a.pdf" }];

    act(() => {
      FakeES.last.emit({
        id: 1,
        action: "DocumentsChanged",
        data: documents,
      });

      jest.advanceTimersByTime(50);

      FakeES.last.emit({
        id: 2,
        action: "DocumentsChanged",
        data: documents,
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
        action: "DocumentsChanged",
        data: documents,
      });
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(onMessage).toHaveBeenCalledTimes(1);

    expect(onMessage).toHaveBeenCalledWith({
      id: 3,
      action: "DocumentsChanged",
      data: {
        action: "DocumentsChanged",
        documents,
      },
    });

    jest.useRealTimers();
  });

  it("closes the connection on unmount", () => {
    const { unmount } = renderHook(() =>
      useDocumentsListener(1, jest.fn(), true, DEBOUNCE),
    );
    const es = FakeES.last;
    unmount();
    expect(es.closed).toBe(true);
  });
});
