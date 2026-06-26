import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { IoFilterOutline, IoFilterSharp } from "react-icons/io5";
import ThemedFilterButton from "@components/ThemedFilterButton";
import { Colors } from "@commons/constants/Colors";

describe("desktop <ThemedFilterButton />", () => {
  it("shows the outline icon when inactive", () => {
    render(<ThemedFilterButton active={false} onPress={() => {}} />);
    expect(screen.UNSAFE_queryByType(IoFilterOutline)).toBeTruthy();
    expect(screen.UNSAFE_queryByType(IoFilterSharp)).toBeNull();
  });

  it("shows the sharp icon when active", () => {
    render(<ThemedFilterButton active onPress={() => {}} />);
    expect(screen.UNSAFE_queryByType(IoFilterSharp)).toBeTruthy();
    expect(screen.UNSAFE_queryByType(IoFilterOutline)).toBeNull();
  });

  it("tints the active icon with the focused icon color", () => {
    render(<ThemedFilterButton active onPress={() => {}} />);
    expect(screen.UNSAFE_getByType(IoFilterSharp).props.color).toBe(
      Colors.light.iconColorFocused,
    );
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<ThemedFilterButton active={false} onPress={onPress} />);
    fireEvent.press(screen.UNSAFE_getByType(IoFilterOutline));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
