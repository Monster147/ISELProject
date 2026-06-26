import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { useAuth } from "@hooks/data/useAuth";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useIntervenorsListener } from "@hooks/listeners/useIntervenorsListener";
import { IntervenorProvider } from "@contexts/IntervenorContext";
import { useIntervenor } from "@hooks/data/useIntervenor";
import { mockIntervenor } from "../../mocks/mockData";

jest.mock("@commons/api/api", () => ({
  api: {
    findAllIntervenors: jest.fn(),
    createIntervenor: jest.fn(),
    updateIntervenor: jest.fn(),
    deleteIntervenorByIdNumber: jest.fn(),
    findIntervenorByIdNumber: jest.fn(),
    findIntervenorByContactInfo: jest.fn(),
    findIntervenorById: jest.fn(),
  },
}));

jest.mock("@hooks/data/useAuth", () => ({ useAuth: jest.fn() }));

jest.mock("@hooks/system/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

jest.mock("@hooks/listeners/useIntervenorsListener", () => ({
  useIntervenorsListener: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseNetwork = useNetworkStatus as jest.Mock;
const mockListener = useIntervenorsListener as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntervenorProvider>{children}</IntervenorProvider>
);
const render = () => renderHook(() => useIntervenor(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: 1 } });
  mockUseNetwork.mockReturnValue({ isOnline: true });
  (mockApi.findAllIntervenors as jest.Mock).mockResolvedValue([]);
});

describe("IntervenorContext / useIntervenor", () => {
  it("loads all intervenors on mount when authenticated and online", async () => {
    (mockApi.findAllIntervenors as jest.Mock).mockResolvedValueOnce([
      mockIntervenor,
    ]);
    const { result } = render();
    await waitFor(() =>
      expect(result.current.intervenor).toEqual([mockIntervenor]),
    );
  });

  it("does not load when offline", () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    render();
    expect(mockApi.findAllIntervenors).not.toHaveBeenCalled();
  });

  it("createIntervenor builds the input payload", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (mockApi.createIntervenor as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = render();
    await result.current.createIntervenor(
      "123",
      "CC",
      "John",
      "john@x.com",
      "Rua 1",
    );
    expect(mockApi.createIntervenor).toHaveBeenCalledWith({
      idNumber: "123",
      idType: "CC",
      name: "John",
      contactInfo: "john@x.com",
      address: "Rua 1",
    });
  });

  it("updateIntervenor forwards the partial payload and id", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (mockApi.updateIntervenor as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = render();
    await result.current.updateIntervenor(10, "123", null, "Jane", null, null);
    expect(mockApi.updateIntervenor).toHaveBeenCalledWith(
      {
        idNumber: "123",
        idType: null,
        name: "Jane",
        contactInfo: null,
        address: null,
      },
      10,
    );
  });

  it("delete + finder methods delegate to api", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (mockApi.deleteIntervenorByIdNumber as jest.Mock).mockResolvedValueOnce(
      undefined,
    );
    (mockApi.findIntervenorByIdNumber as jest.Mock).mockResolvedValueOnce(
      mockIntervenor,
    );
    (mockApi.findIntervenorByContactInfo as jest.Mock).mockResolvedValueOnce(
      mockIntervenor,
    );
    (mockApi.findIntervenorById as jest.Mock).mockResolvedValueOnce(
      mockIntervenor,
    );
    const { result } = render();

    await result.current.deleteIntervenorByIdNumber("123");
    await expect(result.current.getIntervenorByIdNumber("123")).resolves.toBe(
      mockIntervenor,
    );
    await expect(
      result.current.findIntervenorByContactInfo("john@x.com"),
    ).resolves.toBe(mockIntervenor);
    await expect(result.current.findIntervenorById(10)).resolves.toBe(
      mockIntervenor,
    );
    expect(mockApi.deleteIntervenorByIdNumber).toHaveBeenCalledWith("123");
    expect(mockApi.findIntervenorByIdNumber).toHaveBeenCalledWith("123");
  });

  it("updates intervenors on an IntervenorsChanged event", async () => {
    const { result } = render();
    await waitFor(() => expect(mockApi.findAllIntervenors).toHaveBeenCalled());
    const onMessage = mockListener.mock.calls.at(-1)![1];

    await act(async () => {
      onMessage({
        action: "IntervenorsChanged",
        data: { intervenors: [mockIntervenor] },
      });
    });

    expect(result.current.intervenor).toEqual([mockIntervenor]);
  });

  it("throws when used outside of an IntervenorProvider", () => {
    expect(() => renderHook(() => useIntervenor())).toThrow(
      /must be used within IntervenorProvider/,
    );
  });
});
