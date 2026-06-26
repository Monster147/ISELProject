import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemedFilterButton from "@components/ThemedFilterButton";
import { Colors } from "@commons/constants/Colors";

describe("movel <ThemedFilterButton />", () => {
  it("shows the outline icon when inactive", () => {
    render(<ThemedFilterButton active={false} onPress={() => {}} />);
    expect(screen.UNSAFE_getByType(Ionicons).props.name).toBe("filter-outline");
  });

  it("shows the filled icon when active", () => {
    render(<ThemedFilterButton active onPress={() => {}} />);
    expect(screen.UNSAFE_getByType(Ionicons).props.name).toBe("filter");
  });

  it("tints the active icon with the focused icon color", () => {
    render(<ThemedFilterButton active onPress={() => {}} />);
    expect(screen.UNSAFE_getByType(Ionicons).props.color).toBe(
      Colors.light.iconColorFocused,
    );
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<ThemedFilterButton active={false} onPress={onPress} />);
    fireEvent.press(screen.UNSAFE_getByType(Ionicons));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
