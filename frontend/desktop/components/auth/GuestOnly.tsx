import { useAuth } from "@hooks/data/useAuth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import ThemedLoader from "../ThemedLoader";

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
