import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { useAuth } from "@hooks/data/useAuth";
import { __navigateMock } from "react-router";
import GuestOnly from "@components/auth/GuestOnly";

jest.mock("@hooks/data/useAuth", () => ({ useAuth: jest.fn() }));

const mockUseAuth = useAuth as jest.Mock;

beforeEach(() => {
  mockUseAuth.mockReset();
  (__navigateMock as jest.Mock).mockClear();
});

describe("desktop <GuestOnly />", () => {
  it("renders the loader while auth is loading and does not navigate", () => {
    mockUseAuth.mockReturnValue({ token: null, isAuthLoading: true });
    render(
      <GuestOnly>
        <Text>guest content</Text>
      </GuestOnly>,
    );
    expect(screen.queryByText("guest content")).toBeNull();
    expect(__navigateMock).not.toHaveBeenCalled();
  });

  it("renders children for a guest (no token, not loading)", () => {
    mockUseAuth.mockReturnValue({ token: null, isAuthLoading: false });
    render(
      <GuestOnly>
        <Text>guest content</Text>
      </GuestOnly>,
    );
    expect(screen.getByText("guest content")).toBeTruthy();
    expect(__navigateMock).not.toHaveBeenCalled();
  });

  it("redirects an authenticated user to /occurrence", () => {
    mockUseAuth.mockReturnValue({ token: "abc", isAuthLoading: false });
    render(
      <GuestOnly>
        <Text>guest content</Text>
      </GuestOnly>,
    );
    expect(__navigateMock).toHaveBeenCalledWith("/occurrence");
    expect(screen.queryByText("guest content")).toBeNull();
  });
});
