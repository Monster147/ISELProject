import { useContext } from "react";
import { StatsContext } from "@contexts/StatsContext";

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error("useStats must be used within StatsProvider");
  }
  return context;
}
