import { renderHook, act } from "@testing-library/react-native";
import { useDocumentsListener } from "@hooks/listeners/useDocumentsListener";
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

describe("useDocumentsListener", () => {
  it("does not connect when disabled or without a user id", () => {
    const onMessage = jest.fn();
    renderHook(() => useDocumentsListener(1, onMessage, false, DEBOUNCE));
    renderHook(() =>
      useDocumentsListener(undefined, onMessage, true, DEBOUNCE),
    );
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("connects to the documents SSE endpoint when enabled", () => {
    const onMessage = jest.fn();
    renderHook(() => useDocumentsListener(1, onMessage, true, DEBOUNCE));
    expect(FakeEventSource.last?.url).toBe("/api/documents/listen");
  });

  it("forwards a normalized DocumentsChanged message", async () => {
    const onMessage = jest.fn();
    renderHook(() => useDocumentsListener(1, onMessage, true, DEBOUNCE));
    const documents = [{ id: 1, name: "a.pdf" }];
    act(() => {
      FakeEventSource.last!.emit({
        id: 3,
        action: "DocumentsChanged",
        data: documents,
      });
    });
    await flush();
    act(() => {
      FakeEventSource.last!.emit({
        id: 4,
        action: "DocumentsChanged",
        data: documents,
      });
    });
    await flush();
    expect(onMessage.mock.calls).toEqual([
      [
        {
          id: 3,
          action: "DocumentsChanged",
          data: {
            action: "DocumentsChanged",
            documents,
          },
        },
      ],
      [
        {
          id: 4,
          action: "DocumentsChanged",
          data: {
            action: "DocumentsChanged",
            documents,
          },
        },
      ],
    ]);
  });

  it("debounces consecutive messages", async () => {
    jest.useFakeTimers();
    const onMessage = jest.fn();
    renderHook(() => useDocumentsListener(1, onMessage, true, 100));
    const documents = [{ id: 1, name: "a.pdf" }];

    act(() => {
      FakeEventSource.last!.emit({
        id: 1,
        action: "DocumentsChanged",
        data: documents,
      });

      jest.advanceTimersByTime(50);

      FakeEventSource.last!.emit({
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
      FakeEventSource.last!.emit({
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
    const onMessage = jest.fn();
    const { unmount } = renderHook(() =>
      useDocumentsListener(1, onMessage, true, DEBOUNCE),
    );
    const es = FakeEventSource.last!;
    unmount();
    expect(es.closed).toBe(true);
  });
});
