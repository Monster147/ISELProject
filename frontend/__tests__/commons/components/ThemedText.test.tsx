import React from "react";
import { render, screen } from "@testing-library/react-native";
import ThemedText from "@commons/components/ThemedText";
import { Colors } from "@commons/constants/Colors";

describe("<ThemedText />", () => {
  it("renders its children", () => {
    render(<ThemedText>Hello world</ThemedText>);
    expect(screen.getByText("Hello world")).toBeTruthy();
  });

  it("uses the body text color by default", () => {
    render(<ThemedText>body</ThemedText>);
    expect(screen.getByText("body")).toHaveStyle({ color: Colors.light.text });
  });

  it("uses the title color when title is set", () => {
    render(<ThemedText title>heading</ThemedText>);
    expect(screen.getByText("heading")).toHaveStyle({
      color: Colors.light.title,
    });
  });

  it("uses the label color when label is set", () => {
    render(<ThemedText label>field</ThemedText>);
    expect(screen.getByText("field")).toHaveStyle({
      color: Colors.light.label,
    });
  });

  it("merges a custom style on top of the theme color", () => {
    render(<ThemedText style={{ fontSize: 22 }}>styled</ThemedText>);
    const node = screen.getByText("styled");
    expect(node).toHaveStyle({ fontSize: 22, color: Colors.light.text });
  });
});
