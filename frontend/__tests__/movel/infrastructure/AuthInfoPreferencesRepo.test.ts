import {
  AuthInfoPreferencesRepo,
  authInfoRepo,
} from "@infrastructure/AuthInfoPreferencesRepo";
import * as SecureStore from "expo-secure-store";

const Store = SecureStore as unknown as { __reset: () => void };

beforeEach(() => Store.__reset());

describe("movel AuthInfoPreferencesRepo", () => {
  let repo: AuthInfoPreferencesRepo;
  beforeEach(() => {
    repo = new AuthInfoPreferencesRepo();
  });

  it("returns null when no token is stored", async () => {
    await expect(repo.getAuthInfo()).resolves.toBeNull();
  });

  it("saves the token in SecureStore and reads it back", async () => {
    await repo.saveAuthInfo({ token: "abc123" });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("token", "abc123");
    await expect(repo.getAuthInfo()).resolves.toEqual({ token: "abc123" });
  });

  it("clears the stored token", async () => {
    await repo.saveAuthInfo({ token: "abc123" });
    await repo.clearAuthInfo();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("token");
    await expect(repo.getAuthInfo()).resolves.toBeNull();
  });
});
