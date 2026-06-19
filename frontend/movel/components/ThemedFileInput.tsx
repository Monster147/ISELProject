import {
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  Text,
} from "react-native";
import { Colors } from "@commons/constants/Colors";

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
