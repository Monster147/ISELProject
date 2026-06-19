import { useContext } from "react";
import { IntervenorContext } from "../contexts/IntervenorContext";

export function useIntervenor() {
  const context = useContext(IntervenorContext);
  if (!context) {
    throw new Error("useIntervenor must be used within IntervenorProvider");
  }
  return context;
}
