import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import ThemedDateInput from "@components/ThemedDateInput";
const getInput = () => screen.UNSAFE_getByType("input" as any);

describe("desktop <ThemedDateInput />", () => {
  it("renders a date input reflecting the value", () => {
    render(<ThemedDateInput value="2026-06-26" onChangeText={() => {}} />);
    const input = getInput();
    expect(input.props.type).toBe("date");
    expect(input.props.value).toBe("2026-06-26");
  });

  it("defaults to an empty value when none is given", () => {
    render(<ThemedDateInput value={undefined} onChangeText={() => {}} />);
    expect(getInput().props.value).toBe("");
  });

  it("forwards the min and max bounds", () => {
    render(
      <ThemedDateInput
        value="2026-06-26"
        min="2026-01-01"
        max="2026-12-31"
        onChangeText={() => {}}
      />,
    );
    const input = getInput();
    expect(input.props.min).toBe("2026-01-01");
    expect(input.props.max).toBe("2026-12-31");
  });

  it("calls onChangeText with the selected value", () => {
    const onChangeText = jest.fn();
    render(<ThemedDateInput value="" onChangeText={onChangeText} />);
    fireEvent(getInput(), "change", { target: { value: "2026-07-01" } });
    expect(onChangeText).toHaveBeenCalledWith("2026-07-01");
  });
});
