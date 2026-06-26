import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { useAuth } from "@hooks/data/useAuth";
import { __replaceMock } from "expo-router";
import UserOnly from "@components/auth/UserOnly";

jest.mock("@hooks/data/useAuth", () => ({ useAuth: jest.fn() }));

const mockUseAuth = useAuth as jest.Mock;

beforeEach(() => {
  mockUseAuth.mockReset();
  (__replaceMock as jest.Mock).mockClear();
});

describe("movel <UserOnly />", () => {
  it("renders the loader while auth is loading and does not redirect", () => {
    mockUseAuth.mockReturnValue({ token: null, isAuthLoading: true });
    render(
      <UserOnly>
        <Text>secret area</Text>
      </UserOnly>,
    );
    expect(screen.queryByText("secret area")).toBeNull();
    expect(__replaceMock).not.toHaveBeenCalled();
  });

  it("renders children for an authenticated user", () => {
    mockUseAuth.mockReturnValue({ token: "abc", isAuthLoading: false });
    render(
      <UserOnly>
        <Text>secret area</Text>
      </UserOnly>,
    );
    expect(screen.getByText("secret area")).toBeTruthy();
    expect(__replaceMock).not.toHaveBeenCalled();
  });

  it("redirects an unauthenticated user to /login", () => {
    mockUseAuth.mockReturnValue({ token: null, isAuthLoading: false });
    render(
      <UserOnly>
        <Text>secret area</Text>
      </UserOnly>,
    );
    expect(__replaceMock).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("secret area")).toBeNull();
  });
});
