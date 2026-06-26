import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "@contexts/AuthContext";
import { useAuth } from "@hooks/data/useAuth";
import { mockUserHome } from "../../mocks/mockData";

jest.mock("@commons/api/api", () => ({
  api: {
    createToken: jest.fn(),
    createUser: jest.fn(),
    userHome: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;
const Secure = SecureStore as unknown as { __reset: () => void };
const Async = AsyncStorage as unknown as { __reset: () => void };

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);
const render = () => renderHook(() => useAuth(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  Secure.__reset();
  Async.__reset();
});

describe("movel AuthContext", () => {
  it("finishes loading with no token when storage is empty", async () => {
    const { result } = render();
    await waitFor(() => expect(result.current.isAuthLoading).toBe(false));
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it("hydrates token (SecureStore) and user (AsyncStorage) on mount", async () => {
    await SecureStore.setItemAsync("token", "stored-token");
    await AsyncStorage.setItem("userId", JSON.stringify(mockUserHome));

    const { result } = render();
    await waitFor(() => expect(result.current.isAuthLoading).toBe(false));
    expect(result.current.token).toBe("stored-token");
    expect(result.current.user).toEqual(mockUserHome);
  });

  it("login persists token + user and updates state", async () => {
    (mockApi.createToken as jest.Mock).mockResolvedValueOnce({ token: "tk" });
    (mockApi.userHome as jest.Mock).mockResolvedValueOnce(mockUserHome);

    const { result } = render();
    await waitFor(() => expect(result.current.isAuthLoading).toBe(false));

    await act(async () => {
      await result.current.login("ada@example.com", "secret");
    });

    expect(mockApi.createToken).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "secret",
    });
    expect(result.current.token).toBe("tk");
    expect(result.current.user).toEqual(mockUserHome);
    await expect(SecureStore.getItemAsync("token")).resolves.toBe("tk");
  });

  it("login rethrows the api error message", async () => {
    (mockApi.createToken as jest.Mock).mockRejectedValueOnce(
      new Error("user-or-password-are-invalid"),
    );
    const { result } = render();
    await waitFor(() => expect(result.current.isAuthLoading).toBe(false));

    await expect(
      act(async () => {
        await result.current.login("a@b.c", "bad");
      }),
    ).rejects.toThrow("user-or-password-are-invalid");
  });

  it("register creates the user then logs in", async () => {
    (mockApi.createUser as jest.Mock).mockResolvedValueOnce(undefined);
    (mockApi.createToken as jest.Mock).mockResolvedValueOnce({ token: "tk2" });
    (mockApi.userHome as jest.Mock).mockResolvedValueOnce(mockUserHome);

    const { result } = render();
    await waitFor(() => expect(result.current.isAuthLoading).toBe(false));

    await act(async () => {
      await result.current.register("Ada", "ada@example.com", "secret");
    });

    expect(mockApi.createUser).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
      password: "secret",
    });
    expect(result.current.token).toBe("tk2");
  });

  it("logout clears token + user from state and storage", async () => {
    await SecureStore.setItemAsync("token", "stored-token");
    await AsyncStorage.setItem("userId", JSON.stringify(mockUserHome));
    (mockApi.logout as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = render();
    await waitFor(() => expect(result.current.token).toBe("stored-token"));

    await act(async () => {
      await result.current.logout();
    });

    expect(mockApi.logout).toHaveBeenCalledTimes(1);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    await expect(SecureStore.getItemAsync("token")).resolves.toBeNull();
  });

  it("logout still clears local state when the api call fails", async () => {
    await SecureStore.setItemAsync("token", "stored-token");
    (mockApi.logout as jest.Mock).mockRejectedValueOnce(new Error("offline"));

    const { result } = render();
    await waitFor(() => expect(result.current.token).toBe("stored-token"));

    await act(async () => {
      await result.current.logout().catch(() => {});
    });

    expect(result.current.token).toBeNull();
    await expect(SecureStore.getItemAsync("token")).resolves.toBeNull();
  });
});
