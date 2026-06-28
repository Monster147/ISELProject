import { createContext, useCallback, useEffect, useMemo, useRef } from "react";
import { api } from "@commons/api/api";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { offlineIntervenorQueueRepo } from "@infrastructure/offline/OfflineIntervenorQueueRepo";
import { offlineOccurrenceQueueRepo } from "@infrastructure/offline/OfflineOccurrenceQueueRepo";
import { offlineEvidenceQueueRepo } from "@infrastructure/offline/OfflineEvidenceQueueRepo";

type OfflineSyncContextValue = {
  syncAllOfflineQueues: () => Promise<void>;
};

export const OfflineSyncContext = createContext<
  OfflineSyncContextValue | undefined
>(undefined);

/**
 * Aguarda o número de milissegundos indicado antes de continuar a execução.
 * Usado para implementar backoff exponencial entre tentativas de sincronização.
 *
 * @param delayInMs Tempo de espera em milissegundos.
 * @returns Promise que resolve após o tempo indicado.
 */
function delay(delayInMs: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), delayInMs);
  });
}

class OfflineAbortError extends Error {}

/**
 * Trata o erro resultante de uma ação offline, aplicando a estratégia de retry adequada.
 *
 * - Erros de servidor (5xx): aplica backoff exponencial (2^retries segundos) e incrementa
 *   o contador de tentativas antes de voltar a tentar.
 * - Erros de cliente (4xx): remove a ação da fila permanentemente, pois não adianta repetir.
 * - Erros sem status (ex: sem rede): lança {@link OfflineAbortError} para interromper
 *   o ciclo de sincronização e aguardar o restabelecimento da ligação.
 *
 * @param err Erro capturado durante a execução da ação.
 * @param action Ação que falhou, com o seu id e contador de retries atual.
 * @param repo Repositório da fila onde a ação está guardada, usado para atualizar ou remover a ação.
 * @throws {OfflineAbortError} Se o erro não tiver status HTTP (sem ligação à rede).
 */
async function handleActionError(
  err: any,
  action: { id: string; retries: number },
  repo: {
    removeAction(id: string): Promise<void>;
    updateAction(id: string, a: any): Promise<void>;
  },
): Promise<void> {
  const status = err?.status;

  if (status === undefined || status === null || status === 0) {
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

/**
 * Provider responsável por sincronizar as filas de operações offline quando a ligação é restaurada.
 * Processa sequencialmente as filas de intervenientes, ocorrências e evidências,
 * com retry exponencial para erros de servidor (5xx) e remoção automática de ações
 * com erros de cliente (4xx) ou que excederam o número máximo de tentativas.
 * A sincronização é ativada automaticamente quando `isOnline` passa a true.
 * Caso a ligação seja perdida durante a sincronização, as ações ainda não processadas
 * permanecem nas filas e serão retomadas quando a ligação for restabelecida, nada se perde.
 *
 * @param children Árvore de componentes que terão acesso ao contexto de sincronização offline.
 */
export const OfflineSyncProvider = ({ children }) => {
  const isSyncingRef = useRef(false);
  const { isOnline } = useNetworkStatus();

  const syncIntervenorQueue = useCallback(async () => {
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
  }, []);

  const syncOccurrenceQueue = useCallback(async () => {
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
  }, []);

  const syncEvidenceQueue = useCallback(async () => {
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
  }, []);

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
  }, [syncIntervenorQueue, syncOccurrenceQueue, syncEvidenceQueue]);

  useEffect(() => {
    if (isOnline) {
      syncAllOfflineQueues();
    }
  }, [isOnline, syncAllOfflineQueues]);

  const value = useMemo(
    () => ({
      syncAllOfflineQueues,
    }),
    [syncAllOfflineQueues],
  );

  return (
    <OfflineSyncContext.Provider value={value}>
      {children}
    </OfflineSyncContext.Provider>
  );
};
