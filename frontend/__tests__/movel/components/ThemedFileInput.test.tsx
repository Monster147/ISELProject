import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import ThemedFileInput from "@components/ThemedFileInput";

describe("movel <ThemedFileInput />", () => {
  it("renders the label", () => {
    render(<ThemedFileInput label="Choose file" onPress={() => {}} />);
    expect(screen.getByText("Choose file")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    render(<ThemedFileInput label="Choose file" onPress={onPress} />);
    fireEvent.press(screen.getByText("Choose file"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
