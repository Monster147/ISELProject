import { useContext } from "react";
import { StatsContext } from "@contexts/StatsContext";

/**
 * Hook que dá acesso ao contexto de estatísticas na aplicação móvel.
 * Deve ser usado num {@link StatsProvider}.
 *
 * @returns Contexto de estatísticas com operações para obter dados globais e mensais.
 * @throws {Error} Se usado fora de um StatsProvider.
 */
export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error("useStats must be used within StatsProvider");
  }
  return context;
}
