import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import ThemedView from "@components/ThemedView";
import { Colors } from "@commons/constants/Colors";

describe("desktop <ThemedView />", () => {
  it("applies the themed background color", () => {
    render(<ThemedView testID="view" />);
    expect(screen.getByTestId("view")).toHaveStyle({
      backgroundColor: Colors.light.background,
    });
  });

  it("renders its children", () => {
    render(
      <ThemedView>
        <Text>inside</Text>
      </ThemedView>,
    );
    expect(screen.getByText("inside")).toBeTruthy();
  });

  it("merges a custom style", () => {
    render(<ThemedView testID="view" style={{ flex: 1 }} />);
    expect(screen.getByTestId("view")).toHaveStyle({
      backgroundColor: Colors.light.background,
      flex: 1,
    });
  });
});
