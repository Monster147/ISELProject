import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { useAuth } from "@hooks/data/useAuth";
import { __replaceMock } from "expo-router";
import GuestOnly from "@components/auth/GuestOnly";

jest.mock("@hooks/data/useAuth", () => ({ useAuth: jest.fn() }));

const mockUseAuth = useAuth as jest.Mock;

beforeEach(() => {
  mockUseAuth.mockReset();
  (__replaceMock as jest.Mock).mockClear();
});

describe("movel <GuestOnly />", () => {
  it("renders the loader while auth is loading and does not redirect", () => {
    mockUseAuth.mockReturnValue({ token: null, isAuthLoading: true });
    render(
      <GuestOnly>
        <Text>guest content</Text>
      </GuestOnly>,
    );
    expect(screen.queryByText("guest content")).toBeNull();
    expect(__replaceMock).not.toHaveBeenCalled();
  });

  it("renders children for a guest", () => {
    mockUseAuth.mockReturnValue({ token: null, isAuthLoading: false });
    render(
      <GuestOnly>
        <Text>guest content</Text>
      </GuestOnly>,
    );
    expect(screen.getByText("guest content")).toBeTruthy();
    expect(__replaceMock).not.toHaveBeenCalled();
  });

  it("redirects an authenticated user to /occurrence", () => {
    mockUseAuth.mockReturnValue({ token: "abc", isAuthLoading: false });
    render(
      <GuestOnly>
        <Text>guest content</Text>
      </GuestOnly>,
    );
    expect(__replaceMock).toHaveBeenCalledWith("/occurrence");
    expect(screen.queryByText("guest content")).toBeNull();
  });
});
