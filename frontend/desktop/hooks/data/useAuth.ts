import { useContext } from "react";
import { AuthContext } from "@contexts/AuthContext";

/**
 * Hook que dá acesso ao contexto de autenticação.
 * Deve ser usado num {@link AuthProvider}.
 *
 * @returns Contexto de autenticação com token, utilizador e funções de login/logout/registo.
 * @throws {Error} Se usado fora de um AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
