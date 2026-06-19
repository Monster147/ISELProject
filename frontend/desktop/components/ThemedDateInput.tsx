import { useColorScheme } from "react-native";
import { Colors } from "@commons/constants/Colors";

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
