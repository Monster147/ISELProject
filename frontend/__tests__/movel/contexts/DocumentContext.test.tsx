import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { useAuth } from "@hooks/data/useAuth";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useSyncSSE } from "@hooks/sync/useSyncSSE";
import { documentsInfoRepo } from "@infrastructure/DocumentsInfoPreferencesRepo";
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

jest.mock("@hooks/sync/useSyncSSE", () => ({ useSyncSSE: jest.fn() }));

jest.mock("@infrastructure/DocumentsInfoPreferencesRepo", () => ({
  documentsInfoRepo: {
    getDocumentsInfo: jest.fn(),
    saveDocumentsInfo: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuth = useAuth as jest.Mock;
const mockUseNetwork = useNetworkStatus as jest.Mock;
const mockUseSyncSSE = useSyncSSE as jest.Mock;
const repo = documentsInfoRepo as jest.Mocked<typeof documentsInfoRepo>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DocumentProvider>{children}</DocumentProvider>
);
const render = () => renderHook(() => useDocument(), { wrapper });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: 1 } });
  mockUseNetwork.mockReturnValue({ isOnline: true });
  mockUseSyncSSE.mockReturnValue({ lastEvent: undefined });
  (repo.getDocumentsInfo as jest.Mock).mockResolvedValue(null);
  (repo.saveDocumentsInfo as jest.Mock).mockResolvedValue(undefined);
  (mockApi.getAllDocument as jest.Mock).mockResolvedValue([]);
});

describe("movel DocumentContext / useDocument", () => {
  it("fetches all documents from the api and caches them when online", async () => {
    const docs = [{ id: 1, name: "a.pdf" }];
    (mockApi.getAllDocument as jest.Mock).mockResolvedValueOnce(docs);
    const { result } = render();
    await waitFor(() => expect(result.current.documents).toEqual(docs));
    expect(repo.saveDocumentsInfo).toHaveBeenCalledWith(docs);
  });

  it("loads cached documents when offline", async () => {
    const cached = [{ id: 2, name: "cached.pdf" }];
    mockUseNetwork.mockReturnValue({ isOnline: false });
    (repo.getDocumentsInfo as jest.Mock).mockResolvedValue(cached);
    const { result } = render();
    await waitFor(() => expect(result.current.documents).toEqual(cached));
    expect(mockApi.getAllDocument).not.toHaveBeenCalled();
  });

  it("falls back to the cache when the api call fails", async () => {
    const cached = [{ id: 3, name: "fallback.pdf" }];
    (mockApi.getAllDocument as jest.Mock).mockRejectedValueOnce(
      new Error("offline"),
    );
    (repo.getDocumentsInfo as jest.Mock).mockResolvedValue(cached);
    const { result } = render();
    await waitFor(() => expect(result.current.documents).toEqual(cached));
  });

  it("read + download methods delegate to the matching api call", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    (mockApi.getDocumentById as jest.Mock).mockResolvedValueOnce({ id: 2 });
    (mockApi.getDocumentByName as jest.Mock).mockResolvedValueOnce({ id: 3 });
    (mockApi.getDocumentByType as jest.Mock).mockResolvedValueOnce({ id: 4 });
    (mockApi.getAllDocumentTypes as jest.Mock).mockResolvedValueOnce(["pdf"]);
    (mockApi.downloadDocument as jest.Mock).mockResolvedValueOnce(undefined);
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
    await result.current.downloadDocument(5);
    expect(mockApi.getDocumentById).toHaveBeenCalledWith(2);
    expect(mockApi.downloadDocument).toHaveBeenCalledWith(5);
  });

  it("updates and caches documents on a DocumentsChanged sync event", async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const docs = [{ id: 7, name: "new.pdf" }];
    mockUseSyncSSE.mockReturnValue({
      lastEvent: { action: "DocumentsChanged", data: docs },
    });
    const { result } = render();
    await waitFor(() => expect(result.current.documents).toEqual(docs));
    expect(repo.saveDocumentsInfo).toHaveBeenCalledWith(docs);
  });

  it("throws when used outside of a DocumentProvider", () => {
    expect(() => renderHook(() => useDocument())).toThrow(
      /must be used within DocumentProvider/,
    );
  });
});
