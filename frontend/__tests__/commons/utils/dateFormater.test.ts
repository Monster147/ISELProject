import dateFormater from "@commons/utils/dateFormater";

describe("dateFormater", () => {
  it("converts an ISO yyyy-mm-dd date to dd/mm/yyyy", () => {
    expect(dateFormater("2026-06-26")).toBe("26/06/2026");
  });

  it("returns the original string when it is not a full date", () => {
    expect(dateFormater("2026-06")).toBe("2026-06");
    expect(dateFormater("")).toBe("");
    expect(dateFormater("hello")).toBe("hello");
  });

  it("does not validate ranges, it only reorders the parts", () => {
    expect(dateFormater("1999-13-40")).toBe("40/13/1999");
  });
});
