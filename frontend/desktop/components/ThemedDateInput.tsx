import { useColorScheme } from "react-native";
import { Colors } from "@commons/constants/Colors";

/**
 * Input de data nativo HTML adaptado ao tema claro/escuro da aplicação (versão desktop/web).
 * Renderiza um `<input type="date">` estilizado com as cores do tema ativo.
 *
 * @param value Data selecionada no formato `YYYY-MM-DD`.
 * @param onChangeText Callback chamado com o novo valor quando a data é alterada.
 * @param style Estilos inline adicionais.
 * @param min Data mínima selecionável (formato `YYYY-MM-DD`).
 * @param max Data máxima selecionável (formato `YYYY-MM-DD`).
 */
const ThemedDateInput = ({ value, onChangeText, style, min, max }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  return (
    <input
      type="date"
      value={value ?? ""}
      min={min}
      max={max}
      onChange={(e) => onChangeText?.(e.target.value)}
      style={{
        backgroundColor: theme.uiBackground2,
        color: theme.text,
        padding: 20,
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

export default ThemedDateInput;
