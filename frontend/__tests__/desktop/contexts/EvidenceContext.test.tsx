import React from "react";
import { renderHook } from "@testing-library/react-native";
import { api } from "@commons/api/api";
import { EvidenceProvider } from "@contexts/EvidenceContext";
import { useEvidence } from "@hooks/data/useEvidence";
import { mockEvidence } from "../../mocks/mockData";

jest.mock("@commons/api/api", () => ({
  api: {
    createEvidence: jest.fn(),
    findEvidenceById: jest.fn(),
    findEvidenceByOccurrenceId: jest.fn(),
    downloadEvidence: jest.fn(),
    deleteEvidence: jest.fn(),
    updateEvidence: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EvidenceProvider>{children}</EvidenceProvider>
);
const render = () => renderHook(() => useEvidence(), { wrapper });

const file = { platform: "web", file: {} } as any;

beforeEach(() => jest.clearAllMocks());

describe("EvidenceContext / useEvidence", () => {
  it("createEvidence forwards the file and assembles the input object", async () => {
    (mockApi.createEvidence as jest.Mock).mockResolvedValueOnce(mockEvidence);
    const { result } = render();

    const out = await result.current.createEvidence(
      file,
      "photo",
      "loc",
      "desc",
      1,
      42,
    );

    expect(mockApi.createEvidence).toHaveBeenCalledWith(file, {
      type: "photo",
      location: "loc",
      description: "desc",
      reporterId: 1,
      occurrenceId: 42,
    });
    expect(out).toBe(mockEvidence);
  });

  it("findEvidenceById delegates to api", async () => {
    (mockApi.findEvidenceById as jest.Mock).mockResolvedValueOnce(mockEvidence);
    const { result } = render();
    await expect(result.current.findEvidenceById(7)).resolves.toBe(
      mockEvidence,
    );
    expect(mockApi.findEvidenceById).toHaveBeenCalledWith(7);
  });

  it("findEvidenceByOccurrenceId delegates to api", async () => {
    (mockApi.findEvidenceByOccurrenceId as jest.Mock).mockResolvedValueOnce([
      mockEvidence,
    ]);
    const { result } = render();
    await expect(
      result.current.findEvidenceByOccurrenceId(42),
    ).resolves.toEqual([mockEvidence]);
    expect(mockApi.findEvidenceByOccurrenceId).toHaveBeenCalledWith(42);
  });

  it("downloadEvidence requests the evidence with keep=true", async () => {
    (mockApi.downloadEvidence as jest.Mock).mockResolvedValueOnce("blob");
    const { result } = render();
    await expect(result.current.downloadEvidence(7)).resolves.toBe("blob");
    expect(mockApi.downloadEvidence).toHaveBeenCalledWith(7, true);
  });

  it("deleteEvidence delegates to api", async () => {
    (mockApi.deleteEvidence as jest.Mock).mockResolvedValueOnce(undefined);
    const { result } = render();
    await result.current.deleteEvidence(7);
    expect(mockApi.deleteEvidence).toHaveBeenCalledWith(7);
  });

  it("updateEvidence forwards the file and id", async () => {
    (mockApi.updateEvidence as jest.Mock).mockResolvedValueOnce(mockEvidence);
    const { result } = render();
    await expect(result.current.updateEvidence(file, 7)).resolves.toBe(
      mockEvidence,
    );
    expect(mockApi.updateEvidence).toHaveBeenCalledWith(file, 7);
  });

  it("throws when used outside of an EvidenceProvider", () => {
    expect(() => renderHook(() => useEvidence())).toThrow(
      /must be used within EvidenceProvider/,
    );
  });
});
