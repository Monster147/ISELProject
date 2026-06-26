import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { useAuth } from "@hooks/data/useAuth";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useDocumentsListener } from "@hooks/listeners/useDocumentsListener";
import { DocumentProvider } from "@contexts/DocumentContext";
import { useDocument } from "@hooks/data/useDocument";

jest.mock("@commons/api/api", () => ({
  api: {
    getAllDocument: jest.fn(),
    getDocumentById: jest.fn(),
    getDocumentByName: jest.fn(),
    getDocumentByType: jest.fn(),
    getAllDocumentTypes: jest.fn(),
    downloadDocument: jest.fn(),
  },
}));

jest.mock("@hooks/data/useAuth", () => ({ useAuth: jest.fn() }));

jest.mock("@hooks/system/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

jest.mock("@hooks/listeners/useDocumentsListener", () => ({
  useDocumentsListener: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseNetwork = useNetworkStatus as jest.Mock;
const mockListener = useDocumentsListener as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DocumentProvider>{children}</DocumentProvider>
);
const render = () => renderHook(() => useDocument(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: 1 } });
  mockUseNetwork.mockReturnValue({ isOnline: true });
  (mockApi.getAllDocument as jest.Mock).mockResolvedValue([]);
});

describe("DocumentContext", () => {
  it("loads all documents on mount when authenticated and online", async () => {
    const docs = [{ id: 1, name: "doc.pdf" }];
    (mockApi.getAllDocument as jest.Mock).mockResolvedValueOnce(docs);
    const { result } = render();
    await waitFor(() => expect(result.current.documents).toEqual(docs));
  });

  it("does not load when offline", () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    render();
    expect(mockApi.getAllDocument).not.toHaveBeenCalled();
  });

  it("read methods delegate to the matching api call", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (mockApi.getDocumentById as jest.Mock).mockResolvedValueOnce({ id: 2 });
    (mockApi.getDocumentByName as jest.Mock).mockResolvedValueOnce({ id: 3 });
    (mockApi.getDocumentByType as jest.Mock).mockResolvedValueOnce({ id: 4 });
    (mockApi.getAllDocumentTypes as jest.Mock).mockResolvedValueOnce(["pdf"]);
    const { result } = render();

    await expect(result.current.getDocumentById(2)).resolves.toEqual({ id: 2 });
    await expect(result.current.getDocumentByName("a")).resolves.toEqual({
      id: 3,
    });
    await expect(result.current.getDocumentByType("pdf")).resolves.toEqual({
      id: 4,
    });
    await expect(result.current.getAllDocumentTypes()).resolves.toEqual([
      "pdf",
    ]);
    expect(mockApi.getDocumentById).toHaveBeenCalledWith(2);
    expect(mockApi.getDocumentByName).toHaveBeenCalledWith("a");
    expect(mockApi.getDocumentByType).toHaveBeenCalledWith("pdf");
  });

  it("downloadDocument delegates to api", async () => {
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (mockApi.downloadDocument as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = render();
    await result.current.downloadDocument(5);
    expect(mockApi.downloadDocument).toHaveBeenCalledWith(5);
  });

  it("updates documents on a DocumentsChanged event", async () => {
    const { result } = render();
    await waitFor(() => expect(mockApi.getAllDocument).toHaveBeenCalled());
    const onMessage = mockListener.mock.calls.at(-1)![1];
    const docs = [{ id: 7, name: "new.pdf" }];

    await act(async () => {
      onMessage({ action: "DocumentsChanged", data: { documents: docs } });
      await new Promise((r) => setTimeout(r, 350));
    });

    expect(result.current.documents).toEqual(docs);
    expect(result.current.loading).toBe(false);
  });

  it("throws when used outside of a DocumentProvider", () => {
    expect(() => renderHook(() => useDocument())).toThrow(
      /must be used within DocumentProvider/,
    );
  });
});
