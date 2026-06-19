import { useContext } from "react";
import { TypeContext } from "../contexts/TypeContext";

export function useType() {
  const context = useContext(TypeContext);
  if (!context) {
    throw new Error("useType must be used within TypeProvider");
  }
  return context;
}
