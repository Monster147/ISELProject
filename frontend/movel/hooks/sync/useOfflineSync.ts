import { useContext } from "react";
import { OfflineSyncContext } from "@contexts/OfflineSyncContext";

/**
 * Hook que dá acesso ao contexto de sincronização offline na aplicação móvel.
 * Deve ser usado dentro de um {@link OfflineSyncProvider}.
 *
 * @returns Contexto de sincronização com a função `syncAllOfflineQueues`.
 * @throws {Error} Se usado fora de um OfflineSyncProvider.
 */
export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error("useOfflineSync must be used within OfflineSyncProvider");
  }
  return context;
}
