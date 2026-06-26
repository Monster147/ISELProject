import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
jest.mock("@hooks/data/useAuth", () => ({ useAuth: jest.fn() }));
import { useAuth } from "@hooks/data/useAuth";
import { __navigateMock } from "react-router";
import UserOnly from "@components/auth/UserOnly";

const mockUseAuth = useAuth as jest.Mock;

beforeEach(() => {
  mockUseAuth.mockReset();
  (__navigateMock as jest.Mock).mockClear();
});

describe("desktop <UserOnly />", () => {
  it("renders the loader while auth is loading and does not navigate", () => {
    mockUseAuth.mockReturnValue({ token: null, isAuthLoading: true });
    render(
      <UserOnly>
        <Text>secret area</Text>
      </UserOnly>,
    );
    expect(screen.queryByText("secret area")).toBeNull();
    expect(__navigateMock).not.toHaveBeenCalled();
  });

  it("renders children for an authenticated user", () => {
    mockUseAuth.mockReturnValue({ token: "abc", isAuthLoading: false });
    render(
      <UserOnly>
        <Text>secret area</Text>
      </UserOnly>,
    );
    expect(screen.getByText("secret area")).toBeTruthy();
    expect(__navigateMock).not.toHaveBeenCalled();
  });

  it("redirects an unauthenticated user to /login", () => {
    mockUseAuth.mockReturnValue({ token: null, isAuthLoading: false });
    render(
      <UserOnly>
        <Text>secret area</Text>
      </UserOnly>,
    );
    expect(__navigateMock).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("secret area")).toBeNull();
  });
});
