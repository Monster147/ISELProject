import { Pressable, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

/**
 * Botão temático partilhado entre plataformas.
 * Aplica a cor primária da aplicação e reduz a opacidade ao ser pressionado.
 *
 * @param style Estilos adicionais a aplicar ao componente.
 * @param props Restantes props passadas ao `Pressable` (ex: onPress, children).
 */
function ThemedButton({ style, ...props }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]}
      {...props}
    />
  );
}

export default ThemedButton;
const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 6,
    marginVertical: 10,
  },
  pressed: {
    opacity: 0.5,
  },
});
