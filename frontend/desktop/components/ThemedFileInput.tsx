import { useColorScheme } from "react-native";
import { Colors } from "../../commons/constants/Colors";

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
