import { useContext } from "react";
import type { ConfirmContextType } from "@contexts/ConfirmContext";
import { ConfirmContext } from "@contexts/ConfirmContext";

/**
 * Hook que fornece acesso ao contexto de confirmação da versão desktop.
 * Deve ser usado dentro de um {@link ConfirmProvider}.
 *
 * @returns Contexto de confirmação com a função `confirm` e o estado do diálogo.
 * @throws {Error} Se usado fora de um ConfirmProvider.
 */
export function useConfirm(): ConfirmContextType {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
