import { AuthInfoPreferencesRepo } from "@infrastructure/AuthInfoPreferencesRepo";

describe("AuthInfoPreferencesRepo", () => {
  let repo: AuthInfoPreferencesRepo;

  beforeEach(() => {
    localStorage.clear();
    repo = new AuthInfoPreferencesRepo();
  });

  it("returns null when no token has been saved", async () => {
    await expect(repo.getAuthInfo()).resolves.toBeNull();
  });

  it("persists the token under the 'token' key and reads it back", async () => {
    await repo.saveAuthInfo({ token: "abc123" });
    expect(localStorage.getItem("token")).toBe("abc123");
    await expect(repo.getAuthInfo()).resolves.toEqual({ token: "abc123" });
  });

  it("clears the stored token", async () => {
    await repo.saveAuthInfo({ token: "abc123" });
    await repo.clearAuthInfo();
    expect(localStorage.getItem("token")).toBeNull();
    await expect(repo.getAuthInfo()).resolves.toBeNull();
  });
});
