import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { api } from "@commons/api/api";
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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);
const render = () => renderHook(() => useAuth(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("AuthContext / useAuth", () => {
  it("starts loading and finishes with no token when storage is empty", async () => {
    const { result } = render();
    expect(result.current.token).toBeNull();
    await waitFor(() => expect(result.current.isAuthLoading).toBe(false));
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it("hydrates token and user from storage on mount", async () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("userId", JSON.stringify(mockUserHome));

    const { result } = render();
    await waitFor(() => expect(result.current.isAuthLoading).toBe(false));
    expect(result.current.token).toBe("stored-token");
    expect(result.current.user).toEqual(mockUserHome);
  });

  it("login stores the token + user and updates state", async () => {
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
    expect(localStorage.getItem("token")).toBe("tk");
    expect(localStorage.getItem("userId")).toBe(JSON.stringify(mockUserHome));
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

  it("logout calls the api and clears token + user + storage", async () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem("userId", JSON.stringify(mockUserHome));
    (mockApi.logout as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = render();
    await waitFor(() => expect(result.current.token).toBe("stored-token"));

    await act(async () => {
      await result.current.logout();
    });

    expect(mockApi.logout).toHaveBeenCalledTimes(1);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("userId")).toBeNull();
  });

  it("logout still clears local state when the api call fails", async () => {
    localStorage.setItem("token", "stored-token");
    (mockApi.logout as jest.Mock).mockRejectedValueOnce(new Error("offline"));

    const { result } = render();
    await waitFor(() => expect(result.current.token).toBe("stored-token"));

    await act(async () => {
      await result.current.logout().catch(() => {});
    });

    expect(result.current.token).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("throws when used outside of a AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      /useAuth must be used within AuthProvider/,
    );
  });
});
