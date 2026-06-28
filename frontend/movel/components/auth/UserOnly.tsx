import { useAuth } from "@hooks/data/useAuth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import ThemedLoader from "../ThemedLoader";

/**
 * Guard de rota para páginas que requerem autenticação.
 * Se o utilizador não estiver autenticado, redireciona automaticamente para "/login".
 * Enquanto o estado de autenticação está a ser carregado, mostra um loader.
 *
 * @param children Conteúdo a renderizar se o utilizador estiver autenticado.
 */
const UserOnly = ({ children }) => {
  const { token, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!token) {
      router.replace("/login");
    }
  }, [token, isAuthLoading]);

  if (isAuthLoading || !token) {
    return <ThemedLoader />;
  }

  return children;
};

export default UserOnly;
