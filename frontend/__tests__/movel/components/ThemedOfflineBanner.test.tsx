import React from "react";
import { StyleSheet } from "react-native";
import { render, screen } from "@testing-library/react-native";
jest.mock("@hooks/system/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import OfflineBanner from "@components/ThemedOfflineBanner";
import { Colors } from "@commons/constants/Colors";

const mockUseNetworkStatus = useNetworkStatus as jest.Mock;

beforeEach(() => mockUseNetworkStatus.mockReset());

describe("movel <ThemedOfflineBanner />", () => {
  it("renders nothing while connectivity is unknown (null)", () => {
    mockUseNetworkStatus.mockReturnValue({ isOnline: null });
    const { toJSON } = render(<OfflineBanner />);
    expect(toJSON()).toBeNull();
  });

  it("renders nothing when online", () => {
    mockUseNetworkStatus.mockReturnValue({ isOnline: true });
    const { toJSON } = render(<OfflineBanner />);
    expect(toJSON()).toBeNull();
  });

  it("shows the warning banner when offline", () => {
    mockUseNetworkStatus.mockReturnValue({ isOnline: false });
    const json = render(<OfflineBanner />).toJSON() as any;
    const flat = StyleSheet.flatten(json.props.style);
    expect(flat.backgroundColor).toBe(Colors.warning);
    expect(screen.getByText("warning.noConnection")).toBeTruthy();
  });
});
