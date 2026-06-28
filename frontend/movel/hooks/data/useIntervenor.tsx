import { useContext } from "react";
import { IntervenorContext } from "@contexts/IntervenorContext";

/**
 * Hook que dá acesso ao contexto de intervenientes na aplicação móvel.
 * Deve ser usado num {@link IntervenorProvider}.
 *
 * @returns Contexto de intervenientes com a lista e operações de CRUD.
 * @throws {Error} Se usado fora de um IntervenorProvider.
 */
export function useIntervenor() {
  const context = useContext(IntervenorContext);
  if (!context) {
    throw new Error("useIntervenor must be used within IntervenorProvider");
  }
  return context;
}
