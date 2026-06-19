import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, ApiError, fetchApi, getAuthHeaders } from "@commons/api/api";
import { authInfoRepo } from "../infrastructure/AuthInfoPreferencesRepo";
import { userInfoRepo } from "../infrastructure/UserInfoPreferencesRepo";
import { Intervenor } from "@commons/models/intervenor/Intervenor";
import {
  useIntervenorsListener,
  SSEMessage,
} from "../hooks/useIntervenorsListener";
import { occurrenceInfoRepo } from "../infrastructure/OccurrenceInfoPreferencesRepo";
import { intervenorInfoRepo } from "../infrastructure/IntervenorInfoPreferencesRepo";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { offlineIntervenorQueueRepo } from "../infrastructure/offline/OfflineIntervenorQueueRepo";
import id from "../app/(dashboard)/intervenors/[id]";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { useSyncSSE } from "../hooks/useSyncSSE";
import { documentsInfoRepo } from "../infrastructure/DocumentsInfoPreferencesRepo";
import { Evidence } from "@commons/models/evidence/Evidence";

type IntervenorContextValue = {
  createIntervenor: (
    idNumber: string,
    idType: string,
    name: string,
    contactInfo: string,
    address: string,
  ) => Promise<void>;
  updateIntervenor: (
    intervenorId: number,
    idNumber: string | null,
    idType: string | null,
    name: string | null,
    contactInfo: string | null,
    address: string | null,
  ) => Promise<void>;
  deleteIntervenorByIdNumber: (intervenorId: string) => Promise<void>;
  getIntervenorByIdNumber: (idNumber: string) => Promise<any>;
  findIntervenorByContactInfo: (contactInfo: string) => Promise<any>;
  findIntervenorById: (id: number) => Promise<Intervenor>;
  intervenor: Intervenor[];
  loadIntervenors: () => Promise<any>;
};

export const IntervenorContext = createContext<
  IntervenorContextValue | undefined
>(undefined);

export function IntervenorProvider({ children }) {
  const [intervenor, setIntervenor] = useState<Intervenor[]>([]);
  const { isOnline, shouldResetListeners } = useNetworkStatus();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { lastEvent } = useSyncSSE();

  useEffect(() => {
    if (user) {
      if (isOnline) {
        loadIntervenors();
      } else {
        loadCachedIntervenors();
      }
    }
  }, [isOnline, user]);

  useEffect(() => {
    const handleIntervenorsChanged = async () => {
      if (!lastEvent) return;
      if (lastEvent?.action === "IntervenorsChanged") {
        const value = lastEvent.data;
        const intervenors: Intervenor[] = Array.isArray(value) ? value : [];
        setIntervenor(intervenors);
        await intervenorInfoRepo.saveIntervenorInfo(intervenors);
      }
    };

    handleIntervenorsChanged();
  }, [lastEvent]);

  /*
    const handleOnMessage = useCallback(async (message: SSEMessage) => {
        const data = message.data
        const action = message.action
        switch (action) {
            case "IntervenorsChanged":
                setIntervenor(data.intervenors)
                await intervenorInfoRepo.saveIntervenorInfo(data.intervenors)
                break
            default:
                break
        }
    }, [])

    useIntervenorsListener(user?.id,handleOnMessage, isOnline)
     */

  async function loadIntervenors() {
    try {
      const response = await api.findAllIntervenors();
      setIntervenor(response);
      await intervenorInfoRepo.saveIntervenorInfo(response);
    } catch (err: any) {
      loadCachedIntervenors();
    }
  }

  async function loadCachedIntervenors() {
    const cached = await intervenorInfoRepo.getIntervenorInfo();
    if (cached) {
      setIntervenor(cached);
    } else {
      setIntervenor([]);
    }
  }

  async function createIntervenor(
    idNumber: string,
    idType: string,
    name: string,
    contactInfo: string,
    address: string,
  ) {
    if (isOnline) {
      try {
        await api.createIntervenor({
          idNumber,
          idType,
          name,
          contactInfo,
          address,
        });
        await loadIntervenors();
      } catch (err: any) {
        throw Error(err.message);
      }
      return;
    } else {
      if (checkIfIntervenorExistsOffline(contactInfo, idNumber, idType))
        throw Error(t("errorResponse.intervenorAlreadyExists"));
      const payload = {
        id: Date.now(),
        idNumber,
        idType,
        name,
        contactInfo,
        address,
      };
      const updated = [...intervenor, payload as Intervenor];
      setIntervenor(updated);
      await intervenorInfoRepo.saveIntervenorInfo(updated);
      await offlineIntervenorQueueRepo.addAction("CREATE", payload);
    }
  }

  async function updateIntervenor(
    intervenorId: number,
    idNumber: string | null,
    idType: string | null,
    name: string | null,
    contactInfo: string | null,
    address: string | null,
  ) {
    if (isOnline) {
      try {
        await api.updateIntervenor(
          { idNumber, idType, name, contactInfo, address },
          intervenorId,
        );
        await loadIntervenors();
      } catch (err: any) {
        throw Error(err.message);
      }
      return;
    } else {
      const intervenorLocal = intervenor.find((i) => i.id === intervenorId);
      if (!intervenorLocal) {
        throw Error(t("errorResponse.intervenorNotFound"));
      }
      if (
        !checkIfIntervenorCanUpdate(intervenorId, idNumber, idType, contactInfo)
      ) {
        throw Error(t("errorResponse.intervenorAlreadyExists"));
      }
      const updatedData = {
        id: intervenorLocal.id,
        idNumber: idNumber ?? intervenorLocal.idNumber,
        idType: idType ?? intervenorLocal.idType,
        name: name ?? intervenorLocal.name,
        contactInfo: contactInfo ?? intervenorLocal.contactInfo,
        address: address ?? intervenorLocal.address,
      };
      const updated = intervenor.map((i) =>
        i.id === intervenorId ? (updatedData as Intervenor) : i,
      );
      setIntervenor(updated);
      await intervenorInfoRepo.saveIntervenorInfo(updated);
      const queue = await offlineIntervenorQueueRepo.getQueue();
      const existingAction = queue.find(
        (a) => a.type === "CREATE" && a.payload.id === intervenorId,
      );
      if (existingAction) {
        await offlineIntervenorQueueRepo.updateAction(existingAction.id, {
          ...existingAction,
          payload: updatedData,
        });
      } else {
        await offlineIntervenorQueueRepo.addAction("UPDATE", {
          id: intervenorId,
          idNumber,
          idType,
          name,
          contactInfo,
          address,
        });
      }
    }
  }

  async function deleteIntervenorByIdNumber(intervenorId: string) {
    try {
      await api.deleteIntervenorByIdNumber(intervenorId);
      await loadIntervenors();
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function getIntervenorByIdNumber(idNumber: string) {
    try {
      const response = await api.findIntervenorByIdNumber(idNumber);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function findIntervenorByContactInfo(contactInfo: string) {
    try {
      const response = await api.findIntervenorByContactInfo(contactInfo);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function findIntervenorById(id: number) {
    try {
      const response = await api.findIntervenorById(id);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  function checkIfIntervenorExistsOffline(
    contactInfo: string,
    idNumber: string,
    idType: string,
  ): boolean {
    const existsByContact = intervenor.some(
      (i) => i.contactInfo === contactInfo,
    );
    const existsById = intervenor.some(
      (i) => i.idNumber === idNumber && i.idType === idType,
    );
    return existsByContact || existsById;
  }
  function checkIfIntervenorCanUpdate(
    intervenorId: number,
    idNumber: string | null,
    idType: string | null,
    contactInfo: string | null,
  ): boolean {
    if (idNumber !== null || idType !== null) {
      const isDuplicate = intervenor.some(
        (i) =>
          i.id !== intervenorId &&
          i.idNumber ===
            (idNumber ??
              intervenor.find((x) => x.id === intervenorId)?.idNumber) &&
          i.idType ===
            (idType ?? intervenor.find((x) => x.id === intervenorId)?.idType),
      );
      if (isDuplicate) return false;
    }
    if (contactInfo !== null) {
      const isDuplicateContact = intervenor.some(
        (i) => i.id !== intervenorId && i.contactInfo === contactInfo,
      );
      if (isDuplicateContact) return false;
    }
    return true;
  }

  return (
    <IntervenorContext.Provider
      value={{
        createIntervenor,
        updateIntervenor,
        deleteIntervenorByIdNumber,
        getIntervenorByIdNumber,
        findIntervenorByContactInfo,
        findIntervenorById,
        intervenor,
        loadIntervenors,
      }}
    >
      {children}
    </IntervenorContext.Provider>
  );
}
