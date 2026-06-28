import { View, useColorScheme } from "react-native";
import { Colors } from "@commons/constants/Colors";

/**
 * Contentor base adaptado ao tema claro/escuro da aplicação (versão desktop/web).
 * Aplica automaticamente a cor de fundo do tema ativo.
 *
 * @param style Estilos adicionais a aplicar ao `View`.
 * @param safe Ignorado na versão desktop (mantido por compatibilidade com a API mobile).
 * @param props Restantes props passadas ao `View`.
 */
const ThemedView = ({ style, safe = false, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View style={[{ backgroundColor: theme.background }, style]} {...props} />
  );
};

export default ThemedView;
