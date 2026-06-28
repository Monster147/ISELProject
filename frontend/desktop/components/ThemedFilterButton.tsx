import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { IoFilterOutline, IoFilterSharp } from "react-icons/io5";
import { Colors } from "@commons/constants/Colors";

/**
 * Botão de filtro temático para a plataforma web (desktop).
 * Alterna entre os ícones de filtro ativo e inativo consoante o estado.
 *
 * @param style Estilos adicionais a aplicar ao botão.
 * @param active Se true, mostra o ícone de filtro ativo.
 * @param onPress Callback invocado quando o botão é pressionado.
 */
function ThemedFilterButton({ style, active, onPress }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]}
    >
      <View style={styles.content}>
        {active ? (
          <IoFilterSharp size={24} color={theme.iconColorFocused} />
        ) : (
          <IoFilterOutline size={24} color={theme.iconColor} />
        )}
      </View>
    </Pressable>
  );
}

export default ThemedFilterButton;

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 6,
    alignSelf: "flex-start",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.5,
  },
});
