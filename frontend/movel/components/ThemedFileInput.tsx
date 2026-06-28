import {
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  Text,
} from "react-native";
import { Colors } from "@commons/constants/Colors";

/**
 * Botão de seleção de ficheiro para a plataforma móvel.
 * Na plataforma móvel não existe um input de ficheiro nativo equivalente ao desktop,
 * pelo que este componente renderiza um botão que delega a abertura do seletor ao onPress.
 *
 * @param label Texto apresentado no botão.
 * @param onPress Callback invocado quando o botão é pressionado, responsável por abrir o seletor de ficheiros.
 */
const ThemedFileInput = ({ label, onPress }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

export default ThemedFileInput;

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#2d6cdf",
    alignItems: "center",
    marginVertical: 10,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});
