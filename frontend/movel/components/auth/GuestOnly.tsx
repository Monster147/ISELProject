import { useAuth } from "@hooks/data/useAuth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import ThemedLoader from "../ThemedLoader";

/**
 * Guard de rota para páginas exclusivas de utilizadores não autenticados (ex: login, registo).
 * Se o utilizador já estiver autenticado, redireciona automaticamente para "/occurrence".
 * Enquanto o estado de autenticação está a ser carregado, mostra um loader.
 *
 * @param children Conteúdo a renderizar se o utilizador não estiver autenticado.
 */
const GuestOnly = ({ children }) => {
  const { token, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;
    if (token !== null) {
      router.replace("/occurrence");
    }
  }, [token, isAuthLoading]);

  if (isAuthLoading || token) {
    return <ThemedLoader />;
  }

  return children;
};

export default GuestOnly;
