import { useContext } from "react";
import { OccurrenceContext } from "@contexts/OccurrenceContext";

/**
 * Hook que dá acesso ao contexto de ocorrências na aplicação móvel.
 * Deve ser usado num {@link OccurrenceProvider}.
 *
 * @returns Contexto de ocorrências com a lista, operações de consulta e gestão de intervenientes.
 * @throws {Error} Se usado fora de um OccurrenceProvider.
 */
export function useOccurrence() {
  const context = useContext(OccurrenceContext);
  if (!context) {
    throw new Error("useOccurrence must be used within OccurrenceProvider");
  }
  return context;
}
