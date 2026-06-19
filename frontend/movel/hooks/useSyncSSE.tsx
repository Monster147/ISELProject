import { useContext } from "react";
import { SyncSSEContext } from "../contexts/SyncSSEContext";

export function useSyncSSE() {
  const context = useContext(SyncSSEContext);
  if (!context) {
    throw new Error("useSyncSSE must be used within SyncSSEProvider");
  }
  return context;
}
