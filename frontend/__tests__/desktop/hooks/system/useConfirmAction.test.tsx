import { renderHook } from "@testing-library/react-native";
import { useConfirm } from "@hooks/system/useConfirm";
import { useConfirmAction } from "@hooks/system/confirmAction";

jest.mock("@hooks/system/useConfirm", () => ({ useConfirm: jest.fn() }));

const mockUseConfirm = useConfirm as jest.Mock;
const confirm = jest.fn();

const options = {
  title: "Delete",
  message: "Sure?",
  confirmText: "Yes",
  cancelText: "No",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseConfirm.mockReturnValue({ confirm, isOpen: false, dialog: null });
});

describe("useConfirmAction", () => {
  it("runs the action when the user confirms", async () => {
    confirm.mockResolvedValueOnce(true);
    const action = jest.fn().mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useConfirmAction());
    await result.current(action, options);

    expect(confirm).toHaveBeenCalledWith(options);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("does not run the action when the user cancels", async () => {
    confirm.mockResolvedValueOnce(false);
    const action = jest.fn();

    const { result } = renderHook(() => useConfirmAction());
    await result.current(action, options);

    expect(action).not.toHaveBeenCalled();
  });
});
