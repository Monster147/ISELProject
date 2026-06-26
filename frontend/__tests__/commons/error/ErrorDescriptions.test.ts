import { getErrorDescription } from "@commons/errors/ErrorDescriptions";

describe("getErrorDescription", () => {
  it("maps a known error type to its translation key", () => {
    expect(getErrorDescription("user-not-found")).toBe(
      "errorResponse.userNotFound",
    );
    expect(getErrorDescription("email-already-in-use")).toBe(
      "errorResponse.emailAlreadyInUse",
    );
  });

  it("returns the raw error type when it is not in the table", () => {
    expect(getErrorDescription("some-unmapped-error")).toBe(
      "some-unmapped-error",
    );
  });

  it("returns the raw value for an empty string", () => {
    expect(getErrorDescription("")).toBe("");
  });
});
