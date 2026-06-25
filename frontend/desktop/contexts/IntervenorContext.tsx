import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@commons/api/api";
import { Intervenor } from "@commons/models/intervenor/Intervenor";
import {
  useIntervenorsListener,
  SSEMessage,
} from "@hooks/listeners/useIntervenorsListener";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useAuth } from "@hooks/data/useAuth";

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
};

export const IntervenorContext = createContext<
  IntervenorContextValue | undefined
>(undefined);

export function IntervenorProvider({ children }) {
  const [intervenor, setIntervenor] = useState<Intervenor[]>([]);
  const { isOnline } = useNetworkStatus();
  const { user } = useAuth();

  const loadIntervenors = useCallback(async () => {
    try {
      const response = await api.findAllIntervenors();
      setIntervenor(response);
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const createIntervenor = useCallback(
    async (
      idNumber: string,
      idType: string,
      name: string,
      contactInfo: string,
      address: string,
    ) => {
      try {
        await api.createIntervenor({
          idNumber,
          idType,
          name,
          contactInfo,
          address,
        });
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [],
  );

  const updateIntervenor = useCallback(
    async (
      intervenorId: number,
      idNumber: string | null,
      idType: string | null,
      name: string | null,
      contactInfo: string | null,
      address: string | null,
    ) => {
      try {
        await api.updateIntervenor(
          { idNumber, idType, name, contactInfo, address },
          intervenorId,
        );
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [],
  );

  const deleteIntervenorByIdNumber = useCallback(
    async (intervenorId: string) => {
      try {
        await api.deleteIntervenorByIdNumber(intervenorId);
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [],
  );

  const getIntervenorByIdNumber = useCallback(async (idNumber: string) => {
    try {
      const response = await api.findIntervenorByIdNumber(idNumber);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const findIntervenorByContactInfo = useCallback(
    async (contactInfo: string) => {
      try {
        const response = await api.findIntervenorByContactInfo(contactInfo);
        return response;
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [],
  );

  const findIntervenorById = useCallback(async (id: number) => {
    try {
      const response = await api.findIntervenorById(id);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  useEffect(() => {
    if (user && isOnline) {
      loadIntervenors();
    }
  }, [isOnline, user, loadIntervenors]);

  const handleOnMessage = useCallback((message: SSEMessage) => {
    const data = message.data;
    const action = message.action;
    switch (action) {
      case "IntervenorsChanged":
        setIntervenor(data.intervenors);
        break;
      default:
        break;
    }
  }, []);

  useIntervenorsListener(user?.id, handleOnMessage, isOnline);

  const value = useMemo(
    () => ({
      createIntervenor,
      updateIntervenor,
      deleteIntervenorByIdNumber,
      getIntervenorByIdNumber,
      findIntervenorByContactInfo,
      findIntervenorById,
      intervenor,
    }),
    [
      intervenor,
      createIntervenor,
      updateIntervenor,
      deleteIntervenorByIdNumber,
      getIntervenorByIdNumber,
      findIntervenorByContactInfo,
      findIntervenorById,
    ],
  );

  return (
    <IntervenorContext.Provider value={value}>
      {children}
    </IntervenorContext.Provider>
  );
}
