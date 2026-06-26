import React from "react";
import { render } from "@testing-library/react-native";
import Spacer from "@commons/components/Spacer";

describe("<Spacer />", () => {
  it("uses the default width (100%) and height (40)", () => {
    const tree = render(<Spacer />).toJSON();
    expect(tree).toMatchObject({
      type: "View",
      props: { style: { width: "100%", height: 40 } },
    });
  });

  it("honours custom width and height props", () => {
    const tree = render(<Spacer width={20} height={8} />).toJSON();
    expect(tree).toMatchObject({
      props: { style: { width: 20, height: 8 } },
    });
  });
});
