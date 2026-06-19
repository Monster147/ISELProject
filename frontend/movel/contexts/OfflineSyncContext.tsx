import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { api } from "@commons/api/api";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { offlineIntervenorQueueRepo } from "../infrastructure/offline/OfflineIntervenorQueueRepo";
import { offlineOccurrenceQueueRepo } from "../infrastructure/offline/OfflineOccurrenceQueueRepo";
import { offlineEvidenceQueueRepo } from "../infrastructure/offline/OfflineEvidenceQueueRepo";

type OfflineSyncContextValue = {
  syncAllOfflineQueues: () => Promise<void>;
  isSyncing: boolean;
};

export const OfflineSyncContext = createContext<
  OfflineSyncContextValue | undefined
>(undefined);

function delay(delayInMs: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), delayInMs);
  });
}

class OfflineAbortError extends Error {}

async function handleActionError(
  err: any,
  action: { id: string; retries: number },
  repo: {
    removeAction(id: string): Promise<void>;
    updateAction(id: string, a: any): Promise<void>;
  },
): Promise<void> {
  const status = err?.status;

  if (status === undefined || status === null) {
    throw new OfflineAbortError();
  }

  if (status >= 500 && status < 600) {
    const wait = 2 ** action.retries * 1000;
    await delay(wait);
    action.retries++;
    await repo.updateAction(action.id, action);
    return;
  }

  await repo.removeAction(action.id);
}

export const OfflineSyncProvider = ({ children }) => {
  const isSyncingRef = useRef(false);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (isOnline) {
      syncAllOfflineQueues();
    }
  }, [isOnline]);

  const syncAllOfflineQueues = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      await syncIntervenorQueue();
      await syncOccurrenceQueue();
      await syncEvidenceQueue();
    } catch (e) {
      console.error(e);
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  async function syncIntervenorQueue() {
    let queue = await offlineIntervenorQueueRepo.getQueue();
    while (queue.length > 0) {
      for (const action of queue) {
        if (action.retries >= action.maxRetries) {
          await offlineIntervenorQueueRepo.removeAction(action.id);
          continue;
        }
        try {
          switch (action.type) {
            case "CREATE":
              await api.createIntervenor({
                idNumber: action.payload.idNumber,
                idType: action.payload.idType,
                name: action.payload.name,
                contactInfo: action.payload.contactInfo,
                address: action.payload.address,
              });
              await offlineIntervenorQueueRepo.removeAction(action.id);
              break;
            case "UPDATE":
              await api.updateIntervenor(
                {
                  idNumber: action.payload.idNumber,
                  idType: action.payload.idType,
                  name: action.payload.name,
                  contactInfo: action.payload.contactInfo,
                  address: action.payload.address,
                },
                action.payload.id,
              );
              await offlineIntervenorQueueRepo.removeAction(action.id);
              break;
          }
        } catch (err: any) {
          await handleActionError(err, action, offlineIntervenorQueueRepo);
        }
      }
      queue = await offlineIntervenorQueueRepo.getQueue();
    }
  }

  async function syncOccurrenceQueue() {
    let queue = await offlineOccurrenceQueueRepo.getQueue();
    while (queue.length > 0) {
      for (const action of queue) {
        if (action.retries >= action.maxRetries) {
          await offlineOccurrenceQueueRepo.removeAction(action.id);
          continue;
        }
        try {
          switch (action.type) {
            case "ADD_INTERVENOR":
              const intervernorId = await api
                .findIntervenorByIdNumber(action.payload.intervenor.idNumber)
                .then((i) => i.id);
              const response = await api.addIntervenor(
                { intervenorId: intervernorId },
                action.payload.occurrenceId,
              );
              await offlineOccurrenceQueueRepo.removeAction(action.id);
              break;
            case "REMOVE_INTERVENOR":
              const intervernorIdToRemove = await api
                .findIntervenorByIdNumber(action.payload.intervenor.idNumber)
                .then((i) => i.id);
              await api.removeIntervenor(
                { intervenorId: intervernorIdToRemove },
                action.payload.occurrenceId,
              );
              await offlineOccurrenceQueueRepo.removeAction(action.id);
              break;
          }
        } catch (err: any) {
          await handleActionError(err, action, offlineOccurrenceQueueRepo);
        }
      }
      queue = await offlineOccurrenceQueueRepo.getQueue();
    }
  }

  async function syncEvidenceQueue() {
    let queue = await offlineEvidenceQueueRepo.getQueue();
    while (queue.length > 0) {
      for (const action of queue) {
        if (action.retries >= action.maxRetries) {
          await offlineEvidenceQueueRepo.removeAction(action.id);
          continue;
        }
        try {
          switch (action.type) {
            case "CREATE":
              await api.createEvidence(action.payload.file, {
                type: action.payload.type,
                location: action.payload.location,
                description: action.payload.description,
                reporterId: action.payload.reporterId,
                occurrenceId: action.payload.occurrenceId,
              });
              await offlineEvidenceQueueRepo.removeAction(action.id);
              break;
            case "DELETE":
              await api.deleteEvidence(action.payload.evidenceId);
              await offlineEvidenceQueueRepo.removeAction(action.id);
              break;
            case "UPDATE":
              await api.updateEvidence(
                action.payload.file,
                action.payload.evidenceId,
              );
              await offlineEvidenceQueueRepo.removeAction(action.id);
              break;
          }
        } catch (err: any) {
          await handleActionError(err, action, offlineEvidenceQueueRepo);
        }
      }
      queue = await offlineEvidenceQueueRepo.getQueue();
    }
  }

  return (
    <OfflineSyncContext.Provider value={{ syncAllOfflineQueues, isSyncing }}>
      {children}
    </OfflineSyncContext.Provider>
  );
};
