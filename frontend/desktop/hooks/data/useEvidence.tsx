import { useContext } from "react";
import { EvidenceContext } from "@contexts/EvidenceContext";

/**
 * Hook que dá acesso ao contexto de evidências.
 * Deve ser usado num {@link EvidenceProvider}.
 *
 * @returns Contexto de evidências com operações de download e CRUD.
 * @throws {Error} Se usado fora de um EvidenceProvider.
 */
export function useEvidence() {
  const context = useContext(EvidenceContext);
  if (!context) {
    throw new Error("useEvidence must be used within EvidenceProvider");
  }
  return context;
}
