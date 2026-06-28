import { View, useColorScheme, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

/**
 * Cartão temático que adapta a cor de fundo ao esquema de cores do sistema (modo claro/escuro).
 * Aplica bordas arredondadas e padding.
 *
 * @param style Estilos adicionais a aplicar ao componente.
 * @param props Restantes props passadas ao `View`.
 */
const ThemedCard = ({ style, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View
      style={[{ backgroundColor: theme.uiBackground }, styles.card, style]}
      {...props}
    />
  );
};

export default ThemedCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 5,
    padding: 20,
  },
});
