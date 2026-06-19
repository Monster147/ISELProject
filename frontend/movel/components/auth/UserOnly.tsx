import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import ThemedLoader from "../ThemedLoader";

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
