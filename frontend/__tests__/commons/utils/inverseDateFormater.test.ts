import inverseDateFormater from "@commons/utils/inverseDateFormater";
import dateFormater from "@commons/utils/dateFormater";

describe("inverseDateFormater", () => {
  it("converts a dd/mm/yyyy date to yyyy/mm/dd", () => {
    expect(inverseDateFormater("26/06/2026")).toBe("2026/06/26");
  });

  it("returns the original string when it is not a full date", () => {
    expect(inverseDateFormater("26/06")).toBe("26/06");
    expect(inverseDateFormater("")).toBe("");
  });

  it("is the structural inverse of dateFormater (modulo separator)", () => {
    const iso = "2026-06-26";
    const display = dateFormater(iso);
    expect(inverseDateFormater(display)).toBe("2026/06/26");
  });
});
