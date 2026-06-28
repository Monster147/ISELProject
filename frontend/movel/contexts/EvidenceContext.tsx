import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@commons/api/api";
import { UploadFile } from "@commons/models/utils/UploadFile";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { offlineEvidenceQueueRepo } from "@infrastructure/offline/OfflineEvidenceQueueRepo";
import { Evidence } from "@commons/models/evidence/Evidence";
import { useAuth } from "@hooks/data/useAuth";
import { evidenceInfoRepo } from "@infrastructure/EvidenceInfoPreferencesRepo";
import ReactNativeBlobUtil from "react-native-blob-util";
import { useSyncSSE } from "@hooks/sync/useSyncSSE";
import { evidenceCacheService } from "@infrastructure/service/EvidenceCacheService";

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
  downloadEvidence: (evidenceId: number, keep: boolean) => Promise<any>;
  deleteEvidence: (evidenceId: number) => Promise<any>;
  updateEvidence: (file: UploadFile, evidenceId: number) => Promise<any>;
};

export const EvidenceContext = createContext<EvidenceContextValue | undefined>(
  undefined,
);

/**
 * Provider que gere o estado e as operações de evidências na aplicação móvel.
 * Suporta modo offline completo: cria, elimina e atualiza evidências localmente
 * (via {@link offlineEvidenceQueueRepo}) quando não existe conexão, sincronizando depois.
 * Mantém cache local das evidências e pré-carrega os ficheiros para acesso offline.
 * Subscreve atualizações SSE via {@link useSyncSSE}.
 *
 * @param children Árvore de componentes que terão acesso ao contexto de evidências.
 */
export function EvidenceProvider({ children }) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { lastEvent } = useSyncSSE();

  const cacheJsonEvidence = useCallback(
    async (evidenceId: number, content: string) => {
      const cached = (await evidenceInfoRepo.getEvidenceInfo()) ?? [];
      const updated = cached.map((e) =>
        e.id === evidenceId
          ? {
              ...e,
              cachedContent: content,
            }
          : e,
      );
      await evidenceInfoRepo.saveEvidenceInfo(updated);
    },
    [],
  );

  const cacheBinaryEvidence = useCallback(
    async (evidenceId: number, localPath: string) => {
      const cached = (await evidenceInfoRepo.getEvidenceInfo()) ?? [];
      const updated = cached.map((e) =>
        e.id === evidenceId
          ? {
              ...e,
              cachedLocalPath: localPath,
            }
          : e,
      );
      await evidenceInfoRepo.saveEvidenceInfo(updated);
    },
    [],
  );

  const loadCachedEvidences = useCallback(async () => {
    const cached = await evidenceInfoRepo.getEvidenceInfo();
    if (cached) {
      setEvidence(cached);
    } else {
      setEvidence([]);
    }
  }, []);

  const preCacheEvidences = useCallback(
    async (response: Evidence[]) => {
      for (const evidence of response) {
        try {
          const file = await api.downloadEvidence(evidence.id, false);
          if (file) {
            if (evidence.filePath.endsWith(".json")) {
              const text = await file.text();
              await cacheJsonEvidence(evidence.id, text);
            } else {
              const localPath = await evidenceCacheService.cacheFile(
                evidence.id,
                file.path(),
                evidence.filePath,
              );
              await cacheBinaryEvidence(evidence.id, localPath);
            }
          }
        } catch (err) {}
      }
    },
    [cacheJsonEvidence, cacheBinaryEvidence],
  );

  const loadEvidences = useCallback(async () => {
    try {
      const response = await api.findEvidenceByReporterId(user?.id as number);
      setEvidence(response);
      await evidenceInfoRepo.saveEvidenceInfo(response);
      await preCacheEvidences(response);
    } catch (err: any) {
      loadCachedEvidences();
    }
  }, [user, preCacheEvidences, loadCachedEvidences]);

  const createEvidence = useCallback(
    async (
      file: UploadFile,
      type: string,
      location: string,
      description: string,
      reporterId: number,
      occurrenceId: number,
    ) => {
      if (isOnline) {
        try {
          const result = await api.createEvidence(file, {
            type,
            location,
            description,
            reporterId,
            occurrenceId,
          });
          await loadEvidences();
          return result;
        } catch (err: any) {
          throw Error(err.message);
        }
      } else {
        const tempId = Date.now();
        const realFilePath = `occurrences/${occurrenceId}/evidences/${file.name}`;
        const payload = {
          id: tempId,
          type,
          filePath: realFilePath,
          location,
          description,
          reporterId,
          occurrenceId,
          createdAt: tempId,
          updatedAt: tempId,
        };
        const updated = [...evidence, payload as Evidence];
        setEvidence(updated);
        await evidenceInfoRepo.saveEvidenceInfo(updated);
        await offlineEvidenceQueueRepo.addAction("CREATE", {
          file,
          type,
          location,
          description,
          reporterId,
          occurrenceId,
          evidenceId: tempId,
        });
        return { id: tempId, filePath: realFilePath };
      }
    },
    [isOnline, evidence, loadEvidences],
  );

  const findEvidenceById = useCallback(
    async (id: number) => {
      if (isOnline) {
        try {
          const response = await api.findEvidenceById(id);
          return response;
        } catch (err: any) {
          throw Error(err.message);
        }
      } else {
        const cached = await evidenceInfoRepo.getEvidenceInfo();
        if (cached) {
          return cached.find((e) => e.id === id);
        }
      }
    },
    [isOnline],
  );

  const findEvidenceByOccurrenceId = useCallback(
    async (occurrenceId: number) => {
      if (isOnline) {
        try {
          const response = await api.findEvidenceByOccurrenceId(occurrenceId);
          return response;
        } catch (err: any) {
          throw Error(err.message);
        }
      } else {
        const filtered = evidence.filter(
          (e) => e.occurrenceId === occurrenceId,
        );
        return filtered;
      }
    },
    [isOnline, evidence],
  );

  const downloadEvidence = useCallback(
    async (evidenceId: number, keep: boolean) => {
      if (isOnline) {
        try {
          const response = await api.downloadEvidence(evidenceId, keep);
          const evidences = await evidenceInfoRepo.getEvidenceInfo();
          const evidence = evidences?.find((e) => e.id === evidenceId);
          if (evidence) {
            if (evidence.filePath.endsWith(".json")) {
              try {
                const text = await response.text();
                await cacheJsonEvidence(evidenceId, text);
              } catch {}
            } else {
              try {
                const localPath = await evidenceCacheService.cacheFile(
                  evidenceId,
                  response.path(),
                  evidence.filePath,
                );
                await cacheBinaryEvidence(evidenceId, localPath);
              } catch {}
            }
          }

          return response;
        } catch (err: any) {
          throw Error(err.message);
        }
      } else {
        const cached = await evidenceInfoRepo.getEvidenceInfo();
        const evidence = cached?.find((e) => e.id === evidenceId);

        if (evidence.filePath.endsWith(".json")) {
          if (evidence.cachedContent) {
            return {
              text: async () => evidence.cachedContent,
              flush: async () => {},
            };
          }
        }

        if (evidence.cachedLocalPath) {
          const exists = await ReactNativeBlobUtil.fs.exists(
            evidence.cachedLocalPath,
          );
          if (exists) {
            return {
              path: () => evidence.cachedLocalPath,
              respInfo: {
                headers: {
                  "content-type": "application/octet-stream",
                },
              },
              flush: async () => {},
            };
          }
        }

        return null;
      }
    },
    [isOnline, cacheJsonEvidence, cacheBinaryEvidence],
  );

  const deleteEvidence = useCallback(
    async (evidenceId: number) => {
      if (isOnline) {
        try {
          await api.deleteEvidence(evidenceId);
          await loadEvidences();
        } catch (err: any) {
          throw Error(err.message);
        }
      } else {
        const queue = await offlineEvidenceQueueRepo.getQueue();
        const createAction = queue.find(
          (a) => a.type === "CREATE" && a.payload.evidenceId === evidenceId,
        );

        if (createAction) {
          await offlineEvidenceQueueRepo.removeAction(createAction.id);
        } else {
          await offlineEvidenceQueueRepo.addAction("DELETE", { evidenceId });
        }

        const updated = evidence.filter((e) => e.id !== evidenceId);
        setEvidence(updated);
        await evidenceInfoRepo.saveEvidenceInfo(updated);
      }
    },
    [isOnline, evidence, loadEvidences],
  );

  const updateEvidence = useCallback(
    async (file: UploadFile, evidenceId: number) => {
      if (isOnline) {
        try {
          const response = await api.updateEvidence(file, evidenceId);
          return response;
        } catch (err: any) {
          throw Error(err.message);
        }
      } else {
        const queue = await offlineEvidenceQueueRepo.getQueue();

        const createAction = queue.find(
          (a) => a.type === "CREATE" && a.payload.evidenceId === evidenceId,
        );

        if (createAction) {
          const updatedCreateAction = {
            ...createAction,
            payload: {
              ...createAction.payload,
              file: file,
            },
          };
          await offlineEvidenceQueueRepo.updateAction(
            createAction.id,
            updatedCreateAction,
          );
        } else {
          await offlineEvidenceQueueRepo.addAction("UPDATE", {
            file,
            evidenceId,
          });
        }

        const updated = evidence.map((e) => {
          if (e.id === evidenceId) {
            return {
              ...e,
              filePath: file.name,
              updatedAt: Date.now(),
            };
          }
          return e;
        });

        setEvidence(updated);
        await evidenceInfoRepo.saveEvidenceInfo(updated);
        return { id: evidenceId, filePath: file.name };
      }
    },
    [isOnline, evidence],
  );

  useEffect(() => {
    if (user) {
      if (isOnline) {
        loadEvidences();
      } else {
        loadCachedEvidences();
      }
    }
  }, [isOnline, user, loadEvidences, loadCachedEvidences]);

  useEffect(() => {
    const handleEvidencesChanged = async () => {
      if (!lastEvent) return;
      if (lastEvent?.action === "EvidenceChanged") {
        const value = lastEvent.data;
        const evidences: Evidence[] = Array.isArray(value) ? value : [];
        setEvidence(evidences);
        await evidenceInfoRepo.saveEvidenceInfo(evidences);
      }
    };

    handleEvidencesChanged();
  }, [lastEvent]);

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
