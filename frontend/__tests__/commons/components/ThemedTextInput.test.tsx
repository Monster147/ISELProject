import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import ThemedTextInput from "@commons/components/ThemedTextInput";
import { Colors } from "@commons/constants/Colors";

describe("<ThemedTextInput />", () => {
  it("applies the themed background, text color and padding", () => {
    render(<ThemedTextInput testID="input" />);
    expect(screen.getByTestId("input")).toHaveStyle({
      backgroundColor: Colors.light.uiBackground,
      color: Colors.light.text,
      padding: 20,
      borderRadius: 6,
    });
  });

  it("forwards the value and placeholder props", () => {
    render(
      <ThemedTextInput testID="input" value="hello" placeholder="type here" />,
    );
    const input = screen.getByTestId("input");
    expect(input.props.value).toBe("hello");
    expect(input.props.placeholder).toBe("type here");
  });

  it("fires onChangeText when the user types", () => {
    const onChangeText = jest.fn();
    render(<ThemedTextInput testID="input" onChangeText={onChangeText} />);
    fireEvent.changeText(screen.getByTestId("input"), "abc");
    expect(onChangeText).toHaveBeenCalledWith("abc");
  });

  it("merges a custom style", () => {
    render(<ThemedTextInput testID="input" style={{ height: 55 }} />);
    expect(screen.getByTestId("input")).toHaveStyle({
      backgroundColor: Colors.light.uiBackground,
      color: Colors.light.text,
      padding: 20,
      borderRadius: 6,
      height: 55,
    });
  });
});
