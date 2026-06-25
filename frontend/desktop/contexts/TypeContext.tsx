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
import {
  useTypesListener,
  SSEMessage,
} from "@hooks/listeners/useTypesListener";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";

type TypeContextValue = {
  type: Type[];
  findAllTypes: () => Promise<any>;
  loading: boolean;
};

export const TypeContext = createContext<TypeContextValue | undefined>(
  undefined,
);

export const TypeProvider = ({ children }) => {
  const [type, setType] = useState<Type[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { isOnline } = useNetworkStatus();

  const findAllTypes = useCallback(async () => {
    try {
      const response = await api.findAllTypes();
      setType(response);
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  useEffect(() => {
    if (user && isOnline) {
      findAllTypes();
    }
  }, [user, isOnline, findAllTypes]);

  const handleOnMessage = useCallback((message: SSEMessage) => {
    setLoading(true);
    const data = message.data;
    const action = message.action;
    switch (action) {
      case "TypesChanged":
        setType(data.types);
        break;
      default:
        break;
    }
    setTimeout(() => setLoading(false), 300);
  }, []);

  useTypesListener(user?.id, handleOnMessage, isOnline);

  const value = useMemo(
    () => ({
      type,
      findAllTypes,
      loading,
    }),
    [type, loading, findAllTypes],
  );

  return <TypeContext.Provider value={value}>{children}</TypeContext.Provider>;
};
