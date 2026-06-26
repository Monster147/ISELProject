import {
  UserInfoPreferencesRepo,
  userInfoRepo,
} from "@infrastructure/UserInfoPreferencesRepo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Storage = AsyncStorage as unknown as { __reset: () => void };
const sampleUser = {
  id: 1,
  name: "Ada",
  email: "ada@example.com",
  roles: [1, 2],
};

beforeEach(() => Storage.__reset());

describe("movel UserInfoPreferencesRepo", () => {
  let repo: UserInfoPreferencesRepo;
  beforeEach(() => {
    repo = new UserInfoPreferencesRepo();
  });

  it("returns null when no user is stored", async () => {
    await expect(repo.getUserInfo()).resolves.toBeNull();
  });

  it("serializes the user as JSON under the 'userId' key", async () => {
    await repo.saveUserInfo(sampleUser);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "userId",
      JSON.stringify(sampleUser),
    );
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
