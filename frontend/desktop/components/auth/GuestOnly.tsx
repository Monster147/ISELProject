import { useAuth } from "@hooks/data/useAuth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import ThemedLoader from "../ThemedLoader";

/**
 * Guarda de rota para utilizadores não autenticados (versão desktop).
 * Redireciona para `/occurrence` se o utilizador já tiver sessão iniciada.
 * Enquanto o estado de autenticação está a carregar, exibe `ThemedLoader`.
 *
 * @param children Conteúdo a renderizar quando o utilizador não está autenticado.
 */
const GuestOnly = ({ children }) => {
  const { token, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthLoading) return;
    if (token !== null) {
      navigate("/occurrence");
    }
  }, [token, isAuthLoading]);

  if (isAuthLoading || token) {
    return <ThemedLoader />;
  }

  return children;
};

export default GuestOnly;
