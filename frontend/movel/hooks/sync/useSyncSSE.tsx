import { useContext } from "react";
import { SyncSSEContext } from "@contexts/SyncSSEContext";

/**
 * Hook que dá acesso ao contexto SSE centralizado da aplicação móvel.
 * Deve ser usado dentro de um {@link SyncSSEProvider}.
 *
 * @returns Contexto SSE com o `lastEvent` mais recente recebido do servidor.
 * @throws {Error} Se usado fora de um SyncSSEProvider.
 */
export function useSyncSSE() {
  const context = useContext(SyncSSEContext);
  if (!context) {
    throw new Error("useSyncSSE must be used within SyncSSEProvider");
  }
  return context;
}
