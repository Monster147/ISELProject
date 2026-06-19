import { useContext } from "react";
import { TypeContext } from "../ui/contexts/TypeContext";
import { ReportContext } from "../ui/contexts/ReportContext";

export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error("useReport must be used within ReportProvider");
  }
  return context;
}
