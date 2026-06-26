import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import ThemedFileInput from "@components/ThemedFileInput";

const getInput = () => screen.UNSAFE_getByType("input" as any);

describe("desktop <ThemedFileInput />", () => {
  it("renders a file input", () => {
    render(<ThemedFileInput onChange={() => {}} accept="image/*" />);
    expect(getInput().props.type).toBe("file");
  });

  it("forwards the accept attribute and defaults multiple to false", () => {
    render(<ThemedFileInput onChange={() => {}} accept=".pdf" />);
    const input = getInput();
    expect(input.props.accept).toBe(".pdf");
    expect(input.props.multiple).toBe(false);
  });

  it("honours multiple when set", () => {
    render(<ThemedFileInput onChange={() => {}} accept="*" multiple />);
    expect(getInput().props.multiple).toBe(true);
  });

  it("calls onChange when a file is selected", () => {
    const onChange = jest.fn();
    render(<ThemedFileInput onChange={onChange} accept="*" />);
    fireEvent(getInput(), "change", { target: { files: [] } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
