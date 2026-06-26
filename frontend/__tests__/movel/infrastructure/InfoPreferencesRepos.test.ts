import AsyncStorage from "@react-native-async-storage/async-storage";
import { typeInfoRepo } from "@infrastructure/TypeInfopreferencesRepo";
import { intervenorInfoRepo } from "@infrastructure/IntervenorInfoPreferencesRepo";
import { documentsInfoRepo } from "@infrastructure/DocumentsInfoPreferencesRepo";
import { evidenceInfoRepo } from "@infrastructure/EvidenceInfoPreferencesRepo";
import { occurrenceInfoRepo } from "@infrastructure/OccurrenceInfoPreferencesRepo";

const Storage = AsyncStorage as unknown as { __reset: () => void };
beforeEach(() => Storage.__reset());

const repos = [
  {
    name: "TypeInfoPreferencesRepo",
    key: "type",
    repo: typeInfoRepo,
    save: (l: any) => typeInfoRepo.saveTypeInfo(l),
    get: () => typeInfoRepo.getTypeInfo(),
    clear: () => typeInfoRepo.clearTypeInfo(),
    sample: [{ id: 1, name: "Fire", form: {} }],
  },
  {
    name: "IntervenorInfoPreferencesRepo",
    key: "intervenors",
    repo: intervenorInfoRepo,
    save: (l: any) => intervenorInfoRepo.saveIntervenorInfo(l),
    get: () => intervenorInfoRepo.getIntervenorInfo(),
    clear: () => intervenorInfoRepo.clearIntervenorInfo(),
    sample: [
      {
        id: 1,
        idNumber: "123",
        idType: "CC",
        name: "John",
        contactInfo: "j@x.com",
        address: "Rua 1",
      },
    ],
  },
  {
    name: "DocumentsInfoPreferencesRepo",
    key: "documents",
    repo: documentsInfoRepo,
    save: (l: any) => documentsInfoRepo.saveDocumentsInfo(l),
    get: () => documentsInfoRepo.getDocumentsInfo(),
    clear: () => documentsInfoRepo.clearDocumentsInfo(),
    sample: [{ id: 1, name: "a.pdf", type: "pdf", filepath: "/a.pdf" }],
  },
  {
    name: "EvidenceInfoPreferencesRepo",
    key: "evidence",
    repo: evidenceInfoRepo,
    save: (l: any) => evidenceInfoRepo.saveEvidenceInfo(l),
    get: () => evidenceInfoRepo.getEvidenceInfo(),
    clear: () => evidenceInfoRepo.clearEvidenceInfo(),
    sample: [
      {
        id: 1,
        type: {},
        filePath: "/e.jpg",
        location: "x",
        description: "d",
        reporterId: 1,
        occurrenceId: 2,
        createdAt: 0,
        updatedAt: 0,
      },
    ],
  },
  {
    name: "OccurrenceInfoPreferencesRepo",
    key: "occurrence",
    repo: occurrenceInfoRepo,
    save: (l: any) => occurrenceInfoRepo.saveOccurrenceInfo(l),
    get: () => occurrenceInfoRepo.getOccurrenceInfo(),
    clear: () => occurrenceInfoRepo.clearOccurrenceInfo(),
    sample: [
      {
        id: 1,
        initDate: "2026-01-01",
        endDate: "2026-01-02",
        reporterId: 1,
        importance: "HIGH",
        occurrenceType: 1,
        occurrenceInfo: {},
        intervenors: [],
        evidence: [],
      },
    ],
  },
];

describe.each(repos)("$name", ({ key, save, get, clear, sample }) => {
  it("returns null when nothing is stored", async () => {
    await expect(get()).resolves.toBeNull();
  });

  it("serializes the list under its AsyncStorage key", async () => {
    await save(sample);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      key,
      JSON.stringify(sample),
    );
  });

  it("round-trips the stored list", async () => {
    await save(sample);
    await expect(get()).resolves.toEqual(sample);
  });

  it("clears the stored list", async () => {
    await save(sample);
    await clear();
    await expect(get()).resolves.toBeNull();
  });
});
