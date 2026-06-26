import { Alert } from "react-native";
import { confirmAction } from "@hooks/system/confirmAction";

const options = {
  title: "Delete",
  message: "Are you sure?",
  confirmText: "Yes",
  cancelText: "No",
};

let alertSpy: jest.SpyInstance;
beforeEach(() => {
  alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterEach(() => alertSpy.mockRestore());
const lastButtons = () => alertSpy.mock.calls.at(-1)![2] as any[];

describe("confirmAction", () => {
  it("shows an alert with the title and message", () => {
    confirmAction(options, jest.fn());
    expect(alertSpy).toHaveBeenCalledWith(
      "Delete",
      "Are you sure?",
      expect.any(Array),
    );
  });

  it("always adds a cancel button", () => {
    confirmAction(options, jest.fn());
    const cancel = lastButtons().find((b) => b.style === "cancel");
    expect(cancel).toMatchObject({ text: "No", style: "cancel" });
  });

  it("adds a destructive confirm button that runs the action", async () => {
    const action = jest.fn().mockResolvedValueOnce(undefined);
    confirmAction(options, action);

    const confirm = lastButtons().find((b) => b.style === "destructive");
    expect(confirm).toMatchObject({ text: "Yes", style: "destructive" });

    await confirm.onPress();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("does not add a confirm button when no action is provided", () => {
    confirmAction({ ...options, confirmText: "Yes" });
    expect(lastButtons()).toHaveLength(1);
  });

  it("does not add a confirm button when confirmText is missing", () => {
    confirmAction({ title: "t", message: "m", cancelText: "No" }, jest.fn());
    expect(lastButtons()).toHaveLength(1);
  });
});
