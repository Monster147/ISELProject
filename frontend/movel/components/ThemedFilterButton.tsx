import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { Colors } from "@commons/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

/**
 * Botão de filtro temático para a plataforma móvel.
 * Alterna entre os ícones Ionicons de filtro ativo e inativo consoante o estado.
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
          <Ionicons size={24} name={"filter"} color={theme.iconColorFocused} />
        ) : (
          <Ionicons size={24} name={"filter-outline"} color={theme.iconColor} />
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
