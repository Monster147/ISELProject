import { Colors } from "@commons/constants/Colors";
import GuestOnly from "@components/auth/GuestOnly";
import { Outlet } from "react-router";
import ThemedView from "@components/ThemedView";
import { useColorScheme } from "react-native";

/**
 * Layout das rotas de autenticação (login/registo) na versão desktop/web.
 * Envolve as páginas em `GuestOnly`, garantindo que só utilizadores sem sessão lhes acedem,
 * e aplica o fundo do tema ativo. As páginas filhas são renderizadas via `Outlet`.
 */
const AuthLayout = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <GuestOnly>
      <ThemedView style={{ flex: 1, backgroundColor: theme.background }}>
        <Outlet />
      </ThemedView>
    </GuestOnly>
  );
};

export default AuthLayout;
