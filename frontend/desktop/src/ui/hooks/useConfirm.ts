import { useContext } from "react";
import type { ConfirmContextType } from "../contexts/ConfirmContext";
import { ConfirmContext } from "../contexts/ConfirmContext";

export function useConfirm(): ConfirmContextType {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
