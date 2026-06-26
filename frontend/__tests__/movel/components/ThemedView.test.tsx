import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { render, screen } from "@testing-library/react-native";
import ThemedView from "@components/ThemedView";
import { Colors } from "@commons/constants/Colors";

describe("movel <ThemedView />", () => {
  it("renders a plain View with the themed background by default", () => {
    render(<ThemedView testID="view" />);
    const view = screen.getByTestId("view");
    expect(view.type).toBe("View");
    expect(view).toHaveStyle({ backgroundColor: Colors.light.background });
  });

  it("renders inside a SafeAreaView when safe is set", () => {
    render(<ThemedView safe testID="safe" />);
    expect(screen.UNSAFE_getByType(SafeAreaView)).toBeTruthy();
  });

  it("renders its children", () => {
    render(
      <ThemedView>
        <Text>content</Text>
      </ThemedView>,
    );
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("merges a custom style", () => {
    render(<ThemedView testID="view" style={{ padding: 8 }} />);
    expect(screen.getByTestId("view")).toHaveStyle({ padding: 8 });
  });
});
