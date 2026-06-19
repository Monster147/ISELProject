import { useContext } from "react";
import { OccurrenceContext } from "../ui/contexts/OccurrenceContext";

export function useOccurrence() {
  const context = useContext(OccurrenceContext);
  if (!context) {
    throw new Error("useOccurrence must be used within OccurrenceProvider");
  }
  return context;
}
