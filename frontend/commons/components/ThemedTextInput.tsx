import { TextInput, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";

/**
 * Campo de texto temático que adapta as cores de fundo e de texto ao esquema de cores do sistema (modo claro/escuro).
 * Aplica padding e bordas arredondadas.
 *
 * @param style Estilos adicionais a aplicar ao campo de texto.
 * @param props Restantes props passadas ao `TextInput`.
 */
const ThemedTextInput = ({ style, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <TextInput
      style={[
        {
          backgroundColor: theme.uiBackground,
          color: theme.text,
          padding: 20,
          borderRadius: 6,
        },
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedTextInput;
