import React from "react";
import { Text } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import ThemedButton from "@commons/components/ThemedButton";
import { Colors } from "@commons/constants/Colors";

describe("<ThemedButton />", () => {
  it("renders its children", () => {
    render(
      <ThemedButton>
        <Text>Press me</Text>
      </ThemedButton>,
    );
    expect(screen.getByText("Press me")).toBeTruthy();
  });

  it("applies the button style", () => {
    render(
      <ThemedButton testID="btn">
        <Text>Press me</Text>
      </ThemedButton>,
    );
    expect(screen.getByTestId("btn")).toHaveStyle({
      backgroundColor: Colors.primary,
      padding: 18,
      borderRadius: 6,
      marginVertical: 10,
    });
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(
      <ThemedButton onPress={onPress}>
        <Text>Tap</Text>
      </ThemedButton>,
    );
    fireEvent.press(screen.getByText("Tap"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("merges a custom style with the base style", () => {
    render(
      <ThemedButton testID="btn" style={{ marginTop: 99 }}>
        <Text>Tap</Text>
      </ThemedButton>,
    );
    expect(screen.getByTestId("btn")).toHaveStyle({
      backgroundColor: Colors.primary,
      padding: 18,
      borderRadius: 6,
      marginVertical: 10,
      marginTop: 99,
    });
  });
});
