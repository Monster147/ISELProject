import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { Colors } from "@commons/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

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
