import { createContext, useCallback, useMemo } from "react";
import { api } from "@commons/api/api";
import { UploadFile } from "@commons/models/utils/UploadFile";

type EvidenceContextValue = {
  createEvidence: (
    file: UploadFile,
    type: string,
    location: string,
    description: string,
    reporterId: number,
    occurrenceId: number,
  ) => Promise<any>;
  findEvidenceById: (id: number) => Promise<any>;
  findEvidenceByOccurrenceId: (occurrenceId: number) => Promise<any>;
  downloadEvidence: (evidenceId: number) => Promise<any>;
  deleteEvidence: (evidenceId: number) => Promise<any>;
  updateEvidence: (file: UploadFile, evidenceId: number) => Promise<any>;
};

export const EvidenceContext = createContext<EvidenceContextValue | undefined>(
  undefined,
);

/**
 * Provider que disponibiliza as operações de evidências na aplicação desktop.
 * Não mantém estado local de evidências, as operações delegam diretamente na API.
 *
 * @param children Componentes filhos que terão acesso ao contexto de evidências.
 */
export function EvidenceProvider({ children }) {
  const createEvidence = useCallback(
    async (
      file: UploadFile,
      type: string,
      location: string,
      description: string,
      reporterId: number,
      occurrenceId: number,
    ) => {
      try {
        const response = await api.createEvidence(file, {
          type,
          location,
          description,
          reporterId,
          occurrenceId,
        });
        return response;
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [],
  );

  const findEvidenceById = useCallback(async (id: number) => {
    try {
      const response = await api.findEvidenceById(id);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const findEvidenceByOccurrenceId = useCallback(
    async (occurrenceId: number) => {
      try {
        const response = await api.findEvidenceByOccurrenceId(occurrenceId);
        return response;
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [],
  );

  const downloadEvidence = useCallback(async (evidenceId: number) => {
    try {
      const response = await api.downloadEvidence(evidenceId, true);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const deleteEvidence = useCallback(async (evidenceId: number) => {
    try {
      await api.deleteEvidence(evidenceId);
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const updateEvidence = useCallback(
    async (file: UploadFile, evidenceId: number) => {
      try {
        const response = await api.updateEvidence(file, evidenceId);
        return response;
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      createEvidence,
      findEvidenceById,
      findEvidenceByOccurrenceId,
      downloadEvidence,
      deleteEvidence,
      updateEvidence,
    }),
    [
      createEvidence,
      findEvidenceById,
      findEvidenceByOccurrenceId,
      downloadEvidence,
      deleteEvidence,
      updateEvidence,
    ],
  );

  return (
    <EvidenceContext.Provider value={value}>
      {children}
    </EvidenceContext.Provider>
  );
}
