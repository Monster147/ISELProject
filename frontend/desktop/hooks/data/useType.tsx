import { useContext } from "react";
import { TypeContext } from "@contexts/TypeContext";

/**
 * Hook que dá acesso ao contexto de tipos de ocorrência.
 * Deve ser usado num {@link TypeProvider}.
 *
 * @returns Contexto de tipos com a lista e operação de carregamento.
 * @throws {Error} Se usado fora de um TypeProvider.
 */
export function useType() {
  const context = useContext(TypeContext);
  if (!context) {
    throw new Error("useType must be used within TypeProvider");
  }
  return context;
}
