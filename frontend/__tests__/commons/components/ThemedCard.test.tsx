import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import ThemedCard from "@commons/components/ThemedCard";
import { Colors } from "@commons/constants/Colors";

describe("<ThemedCard />", () => {
  it("renders children inside the card", () => {
    render(
      <ThemedCard>
        <Text>card content</Text>
      </ThemedCard>,
    );
    expect(screen.getByText("card content")).toBeTruthy();
  });

  it("applies the themed background and card padding/radius", () => {
    render(<ThemedCard testID="card" />);
    expect(screen.getByTestId("card")).toHaveStyle({
      backgroundColor: Colors.light.uiBackground,
      borderRadius: 5,
      padding: 20,
    });
  });

  it("merges a custom style", () => {
    render(<ThemedCard testID="card" style={{ margin: 12 }} />);
    expect(screen.getByTestId("card")).toHaveStyle({
      backgroundColor: Colors.light.uiBackground,
      borderRadius: 5,
      padding: 20,
      margin: 12,
    });
  });
});
