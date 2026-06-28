import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Type } from "@commons/models/type/Type";
import { api } from "@commons/api/api";
import { useAuth } from "@hooks/data/useAuth";
import { typeInfoRepo } from "@infrastructure/TypeInfopreferencesRepo";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useSyncSSE } from "@hooks/sync/useSyncSSE";

type TypeContextValue = {
  type: Type[];
  findAllTypes: () => Promise<any>;
};

export const TypeContext = createContext<TypeContextValue | undefined>(
  undefined,
);

/**
 * Provider que gere o estado e as operações de tipos de ocorrência na aplicação móvel.
 * Suporta modo offline: carrega da API quando online, com fallback para cache local ({@link typeInfoRepo}).
 * Subscreve atualizações SSE via {@link useSyncSSE}.
 *
 * @param children Árvore de componentes que terão acesso ao contexto de tipos.
 */
export const TypeProvider = ({ children }) => {
  const [type, setType] = useState<Type[]>([]);
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { lastEvent } = useSyncSSE();

  const loadCachedTypes = useCallback(async () => {
    const cached = await typeInfoRepo.getTypeInfo();
    if (cached) {
      setType(cached);
    } else {
      setType([]);
    }
  }, []);

  const findAllTypes = useCallback(async () => {
    try {
      const response = await api.findAllTypes();
      setType(response);
      await typeInfoRepo.saveTypeInfo(response);
    } catch (err: any) {
      loadCachedTypes();
    }
  }, [loadCachedTypes]);

  useEffect(() => {
    if (user) {
      if (isOnline) {
        findAllTypes();
      } else {
        loadCachedTypes();
      }
    }
  }, [user, isOnline, findAllTypes, loadCachedTypes]);

  useEffect(() => {
    const handleTypesChanged = async () => {
      if (!lastEvent) return;
      if (lastEvent?.action === "TypesChanged") {
        const value = lastEvent.data;
        const types: Type[] = Array.isArray(value) ? value : [];
        setType(types);
        await typeInfoRepo.saveTypeInfo(types);
      }
    };

    handleTypesChanged();
  }, [lastEvent]);

  const value = useMemo(
    () => ({
      type,
      findAllTypes,
    }),
    [type, findAllTypes],
  );

  return <TypeContext.Provider value={value}>{children}</TypeContext.Provider>;
};
