import React from "react";
import { ActivityIndicator } from "react-native";
import { render, screen } from "@testing-library/react-native";
import ThemedLoader from "@components/ThemedLoader";
import { Colors } from "@commons/constants/Colors";

describe("desktop <ThemedLoader />", () => {
  it("renders an ActivityIndicator", () => {
    render(<ThemedLoader />);
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("uses a large spinner tinted with the theme text color", () => {
    render(<ThemedLoader />);
    const spinner = screen.UNSAFE_getByType(ActivityIndicator);
    expect(spinner.props.size).toBe("large");
    expect(spinner.props.color).toBe(Colors.light.text);
  });
});
