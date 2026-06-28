import { useColorScheme } from "react-native";
import { Colors } from "@commons/constants/Colors";

/**
 * Input de ficheiro para a plataforma web (desktop).
 * Renderiza um elemento HTML `<input type="file">` com as cores do tema ativo.
 *
 * @param onChange Callback invocado quando o utilizador seleciona ficheiros.
 * @param accept Tipos de ficheiro aceites (ex: ".pdf, .jpg").
 * @param multiple Se true, permite selecionar múltiplos ficheiros. Por omissão: false.
 * @param style Estilos inline adicionais a aplicar ao input.
 */
const ThemedFileInput = ({ onChange, accept, multiple = false, style }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <input
      type="file"
      accept={accept}
      multiple={multiple}
      onChange={onChange}
      style={{
        backgroundColor: theme.uiBackground2,
        color: theme.text,
        padding: 12,
        borderRadius: 6,
        border: "none",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
};

export default ThemedFileInput;
