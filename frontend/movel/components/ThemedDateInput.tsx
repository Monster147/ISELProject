import { useState } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "@commons/constants/Colors";
import ThemedText from "@commons/components/ThemedText";
import ThemedView from "./ThemedView";

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

const ThemedDateInput = ({ value, onChangeText, style, placeholder }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [show, setShow] = useState(false);

  const selectedDate = value ? new Date(value) : new Date();

  const handleChange = (_: any, date?: Date) => {
    setShow(false);

    if (!date) return;

    onChangeText?.(formatDate(date));
  };

  return (
    <ThemedView>
      <Pressable
        onPress={() => setShow(true)}
        style={[styles.input, { backgroundColor: theme.uiBackground2 }, style]}
      >
        <ThemedText> {value || placeholder} </ThemedText>
      </Pressable>

      {show && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}
    </ThemedView>
  );
};

export default ThemedDateInput;

const styles = StyleSheet.create({
  input: {
    padding: 20,
    borderRadius: 6,
    justifyContent: "center",
  },
});
