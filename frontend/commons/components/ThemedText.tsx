import { useColorScheme, Text } from "react-native";
import { Colors } from "../constants/Colors";

/**
 * Componente de texto temático que adapta automaticamente a cor ao esquema de cores do sistema (modo claro/escuro).
 * Suporta três variantes de cor: título, label e texto padrão.
 *
 * @param style Estilos adicionais a aplicar ao texto.
 * @param title Se true, usa a cor de título (maior contraste). Por omissão: false.
 * @param label Se true, usa a cor de label (tom intermédio). Por omissão: false.
 * @param props Restantes props passadas ao componente `Text`.
 */
const ThemedText = ({ style, title = false, label = false, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const textColor = title ? theme.title : label ? theme.label : theme.text;
  return <Text style={[{ color: textColor }, style]} {...props} />;
};

export default ThemedText;
