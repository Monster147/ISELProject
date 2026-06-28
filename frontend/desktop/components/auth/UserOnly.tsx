import { useAuth } from "@hooks/data/useAuth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import ThemedLoader from "../ThemedLoader";

/**
 * Guarda de rota para utilizadores autenticados (versão desktop/web).
 * Redireciona para `/login` se o utilizador não tiver sessão iniciada.
 * Enquanto o estado de autenticação está a carregar, exibe `ThemedLoader`.
 *
 * @param children Conteúdo a renderizar quando o utilizador está autenticado.
 */
const UserOnly = ({ children }) => {
  const { token, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!token) {
      navigate("/login");
    }
  }, [token, isAuthLoading]);

  if (isAuthLoading || !token) {
    return <ThemedLoader />;
  }

  return children;
};

export default UserOnly;
