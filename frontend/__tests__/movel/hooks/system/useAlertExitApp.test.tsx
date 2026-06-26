import { renderHook } from "@testing-library/react-native";
import { Alert, BackHandler } from "react-native";
import { useAlertExitApp } from "@hooks/system/useAlertExitApp";

let addSpy: jest.SpyInstance;
let alertSpy: jest.SpyInstance;
let exitSpy: jest.SpyInstance;
const removeMock = jest.fn();

beforeEach(() => {
  removeMock.mockClear();
  addSpy = jest
    .spyOn(BackHandler, "addEventListener")
    .mockReturnValue({ remove: removeMock } as any);
  alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  exitSpy = jest.spyOn(BackHandler, "exitApp").mockImplementation(() => {});
});
afterEach(() => {
  addSpy.mockRestore();
  alertSpy.mockRestore();
  exitSpy.mockRestore();
});

describe("useAlertExitApp", () => {
  it("registers a hardwareBackPress handler", () => {
    renderHook(() => useAlertExitApp());
    expect(addSpy).toHaveBeenCalledWith(
      "hardwareBackPress",
      expect.any(Function),
    );
  });

  it("shows the exit confirmation alert and consumes the back press", () => {
    renderHook(() => useAlertExitApp());
    const backAction = addSpy.mock.calls.at(-1)![1] as () => boolean;

    const handled = backAction();

    expect(handled).toBe(true);
    expect(alertSpy).toHaveBeenCalledWith(
      "exitApp.title",
      "exitApp.message",
      expect.any(Array),
    );
  });

  it("exits the app when the confirm button is pressed", () => {
    renderHook(() => useAlertExitApp());
    const backAction = addSpy.mock.calls.at(-1)![1] as () => boolean;
    backAction();

    const buttons = alertSpy.mock.calls.at(-1)![2] as any[];
    const confirm = buttons.find((b) => b.text === "exitApp.confirm");
    confirm.onPress();
    expect(exitSpy).toHaveBeenCalled();
  });

  it("removes the back handler on unmount", () => {
    const { unmount } = renderHook(() => useAlertExitApp());
    unmount();
    expect(removeMock).toHaveBeenCalled();
  });
});
