import { UserInfoPreferencesRepo } from "@infrastructure/UserInfoPreferencesRepo";

const sampleUser = {
  id: 1,
  name: "Ada Lovelace",
  email: "ada@example.com",
  roles: [1, 2],
};

describe("UserInfoPreferencesRepo", () => {
  let repo: UserInfoPreferencesRepo;

  beforeEach(() => {
    localStorage.clear();
    repo = new UserInfoPreferencesRepo();
  });

  it("returns null when no user has been saved", async () => {
    await expect(repo.getUserInfo()).resolves.toBeNull();
  });

  it("serializes the user as JSON under the 'userId' key", async () => {
    await repo.saveUserInfo(sampleUser);
    expect(localStorage.getItem("userId")).toBe(JSON.stringify(sampleUser));
  });

  it("round-trips the user object", async () => {
    await repo.saveUserInfo(sampleUser);
    await expect(repo.getUserInfo()).resolves.toEqual(sampleUser);
  });

  it("clears the stored user", async () => {
    await repo.saveUserInfo(sampleUser);
    await repo.clearUserInfo();
    await expect(repo.getUserInfo()).resolves.toBeNull();
  });
});
