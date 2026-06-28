import { ActivityIndicator, useColorScheme } from "react-native";
import { Colors } from "@commons/constants/Colors";
import ThemedView from "./ThemedView";

/**
 * Indicador de carregamento temático para a plataforma web (desktop).
 * Renderiza um `ActivityIndicator` centrado com a cor do texto do tema ativo.
 *
 * @param style Estilos adicionais a aplicar ao contentor.
 */
const ThemedLoader = ({ style }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <ThemedView
      style={[
        { flex: 1, justifyContent: "center", alignItems: "center" },
        style,
      ]}
    >
      <ActivityIndicator size="large" color={theme.text} />
    </ThemedView>
  );
};

export default ThemedLoader;
