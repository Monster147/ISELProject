import { useState } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "@commons/constants/Colors";
import ThemedText from "@commons/components/ThemedText";
import ThemedView from "./ThemedView";

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

/**
 * Input de data nativo para a plataforma móvel.
 * Renderiza um `Pressable` que abre o seletor de data do sistema operativo (`DateTimePicker`).
 * A data é formatada para YYYY-MM-DD antes de ser passada ao callback.
 *
 * @param value Valor atual da data no formato YYYY-MM-DD.
 * @param onChangeText Callback invocado com a data selecionada no formato YYYY-MM-DD.
 * @param style Estilos adicionais a aplicar ao campo.
 * @param placeholder Texto apresentado quando não existe data selecionada.
 */
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
