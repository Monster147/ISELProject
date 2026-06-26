import React from "react";
import { renderHook } from "@testing-library/react-native";
jest.mock("@contexts/AuthContext", () => {
  const ReactLib = require("react");
  return { AuthContext: ReactLib.createContext(undefined) };
});
import { AuthContext } from "@contexts/AuthContext";
import { useAuth } from "@hooks/data/useAuth";

describe("desktop useAuth", () => {
  it("returns the context value when wrapped in a provider", () => {
    const value = {
      token: "t",
      isAuthLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      user: null,
    };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={value as any}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current).toBe(value);
  });

  it("throws when used outside of an AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      /must be used within AuthProvider/,
    );
  });
});
