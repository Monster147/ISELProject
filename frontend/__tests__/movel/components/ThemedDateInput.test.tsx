import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ThemedDateInput from "@components/ThemedDateInput";

describe("movel <ThemedDateInput />", () => {
  it("shows the placeholder when there is no value", () => {
    render(
      <ThemedDateInput
        value=""
        placeholder="Pick a date"
        onChangeText={() => {}}
      />,
    );
    expect(screen.getByText(/Pick a date/)).toBeTruthy();
  });

  it("shows the current value when set", () => {
    render(<ThemedDateInput value="2026-06-26" onChangeText={() => {}} />);
    expect(screen.getByText(/2026-06-26/)).toBeTruthy();
  });

  it("does not show the picker until pressed", () => {
    render(
      <ThemedDateInput
        value=""
        placeholder="Pick a date"
        onChangeText={() => {}}
      />,
    );
    expect(screen.UNSAFE_queryByType(DateTimePicker)).toBeNull();
  });

  it("opens the picker when pressed", () => {
    render(
      <ThemedDateInput
        value=""
        placeholder="Pick a date"
        onChangeText={() => {}}
      />,
    );
    fireEvent.press(screen.getByText(/Pick a date/));
    expect(screen.UNSAFE_getByType(DateTimePicker)).toBeTruthy();
  });

  it("calls onChangeText with the picked date formatted as yyyy-mm-dd", () => {
    const onChangeText = jest.fn();
    render(
      <ThemedDateInput
        value=""
        placeholder="Pick a date"
        onChangeText={onChangeText}
      />,
    );
    fireEvent.press(screen.getByText(/Pick a date/));
    fireEvent(
      screen.UNSAFE_getByType(DateTimePicker),
      "change",
      {},
      new Date("2026-07-01T00:00:00.000Z"),
    );
    expect(onChangeText).toHaveBeenCalledWith("2026-07-01");
  });
});
