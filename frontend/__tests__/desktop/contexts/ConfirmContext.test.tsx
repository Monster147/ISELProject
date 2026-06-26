import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { ConfirmProvider } from "@contexts/ConfirmContext";
import { useConfirm } from "@hooks/system/useConfirm";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConfirmProvider>{children}</ConfirmProvider>
);
const render = () => renderHook(() => useConfirm(), { wrapper });

const options = {
  title: "Delete?",
  message: "Are you sure?",
  confirmText: "Yes",
  cancelText: "No",
};

describe("ConfirmContext / useConfirm", () => {
  it("starts closed with no dialog", () => {
    const { result } = render();
    expect(result.current.isOpen).toBe(false);
    expect(result.current.dialog).toBeNull();
  });

  it("opens a dialog when confirm() is called", () => {
    const { result } = render();
    act(() => {
      result.current.confirm(options);
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.dialog?.options).toEqual(options);
  });

  it("resolves true and closes when the dialog is confirmed", async () => {
    const { result } = render();
    let promise!: Promise<boolean>;
    act(() => {
      promise = result.current.confirm(options);
    });
    act(() => {
      result.current.dialog!.onConfirm();
    });
    await expect(promise).resolves.toBe(true);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.dialog).toBeNull();
  });

  it("resolves false and closes when the dialog is cancelled", async () => {
    const { result } = render();
    let promise!: Promise<boolean>;
    act(() => {
      promise = result.current.confirm(options);
    });
    act(() => {
      result.current.dialog!.onCancel();
    });
    await expect(promise).resolves.toBe(false);
    expect(result.current.isOpen).toBe(false);
  });

  it("throws when used outside of a ConfirmProvider", () => {
    expect(() => renderHook(() => useConfirm())).toThrow(
      /must be used within a ConfirmProvider/,
    );
  });
});
