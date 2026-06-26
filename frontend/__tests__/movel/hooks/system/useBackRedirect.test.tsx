import { renderHook } from "@testing-library/react-native";
import { BackHandler } from "react-native";
import { useBackRedirect } from "@hooks/system/useBackRedirect";

let addSpy: jest.SpyInstance;
const removeMock = jest.fn();

beforeEach(() => {
  removeMock.mockClear();
  addSpy = jest
    .spyOn(BackHandler, "addEventListener")
    .mockReturnValue({ remove: removeMock } as any);
});
afterEach(() => addSpy.mockRestore());

describe("useBackRedirect", () => {
  it("registers a hardwareBackPress handler", () => {
    renderHook(() => useBackRedirect(jest.fn()));
    expect(addSpy).toHaveBeenCalledWith(
      "hardwareBackPress",
      expect.any(Function),
    );
  });

  it("runs the supplied action and consumes the back press", () => {
    const action = jest.fn();
    renderHook(() => useBackRedirect(action));
    const backAction = addSpy.mock.calls.at(-1)![1] as () => boolean;

    const handled = backAction();

    expect(action).toHaveBeenCalledTimes(1);
    expect(handled).toBe(true);
  });

  it("removes the back handler on unmount", () => {
    const { unmount } = renderHook(() => useBackRedirect(jest.fn()));
    unmount();
    expect(removeMock).toHaveBeenCalled();
  });
});
