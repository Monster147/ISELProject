import { useContext } from "react";
import { ReportContext } from "@contexts/ReportContext";

/**
 * Hook que dá acesso ao contexto de relatórios.
 * Deve ser usado num {@link ReportProvider}.
 *
 * @returns Contexto de relatórios com operações de CRUD, submissão, atualização de estado e download.
 * @throws {Error} Se usado fora de um ReportProvider.
 */
export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error("useReport must be used within ReportProvider");
  }
  return context;
}
