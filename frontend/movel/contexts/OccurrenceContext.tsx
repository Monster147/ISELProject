import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@commons/api/api";
import { Occurrence } from "@commons/models/occurrence/Occurrence";
import { useAuth } from "@hooks/data/useAuth";
import { occurrenceInfoRepo } from "@infrastructure/OccurrenceInfoPreferencesRepo";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useTranslation } from "react-i18next";
import { offlineOccurrenceQueueRepo } from "@infrastructure/offline/OfflineOccurrenceQueueRepo";
import { intervenorInfoRepo } from "@infrastructure/IntervenorInfoPreferencesRepo";
import { useSyncSSE } from "@hooks/sync/useSyncSSE";

type OccurrenceContextValue = {
  listOccurrences: () => Promise<void>;
  occurrence: Occurrence[];
  getOccurrence: (id: number) => Promise<Occurrence | undefined>;
  addIntervenorToOccurrence: (
    intervenorId: number,
    occurrenceId: number,
  ) => Promise<void>;
  removeIntervenorFromOccurrence: (
    intervenorId: number,
    occurrenceId: number,
  ) => Promise<void>;
  loading: boolean;
};

export const OccurrenceContext = createContext<
  OccurrenceContextValue | undefined
>(undefined);

export function OccurrenceProvider({ children }) {
  const [occurrence, setOccurrence] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(false);
  const { isOnline } = useNetworkStatus();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { lastEvent } = useSyncSSE();

  const loadCachedOccurrences = useCallback(async () => {
    setLoading(true);
    const cached = await occurrenceInfoRepo.getOccurrenceInfo();
    if (cached) {
      setOccurrence(cached);
    } else {
      setOccurrence([]);
    }
    setLoading(false);
  }, []);

  const listOccurrences = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.findOccurrencesByReporterId(user.id);
      setOccurrence(response);
      await occurrenceInfoRepo.saveOccurrenceInfo(response);
    } catch (err: any) {
      loadCachedOccurrences();
    } finally {
      setLoading(false);
    }
  }, [user, loadCachedOccurrences]);

  const getOccurrence = useCallback(
    async (id: number) => {
      try {
        if (!user) return;
        const response = await api.findOccurrenceById(id);
        return response;
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [user],
  );

  const checkIfIntervenorIsInOccurrence = useCallback(
    (intervenorId: number, occurrenceId: number) => {
      const occ = occurrence.find((o) => o.id === occurrenceId);
      if (!occ) return false;
      return occ.intervenors.some((i) => i === intervenorId);
    },
    [occurrence],
  );

  const addIntervenorToOccurrence = useCallback(
    async (intervenorId: number, occurrenceId: number) => {
      if (isOnline) {
        try {
          if (!user) return;
          await api.addIntervenor({ intervenorId }, occurrenceId);
          const response = await api.findOccurrencesByReporterId(user.id);
          setOccurrence(response);
        } catch (err: any) {
          throw Error(err.message);
        }
        return;
      } else {
        if (checkIfIntervenorIsInOccurrence(intervenorId, occurrenceId))
          throw Error(t("errorResponse.intervenorAlreadyInOccurrence"));
        const intervenors = await intervenorInfoRepo.getIntervenorInfo();
        const intervenor = intervenors?.find((i) => i.id === intervenorId);
        if (!intervenor) throw Error(t("errorResponse.intervenorNotFound"));
        const payload = { intervenor: intervenor, occurrenceId: occurrenceId };
        const updated = occurrence.map((o) => {
          if (o.id === occurrenceId) {
            return { ...o, intervenors: [...o.intervenors, intervenorId] };
          }
          return o;
        });
        setOccurrence(updated);
        await occurrenceInfoRepo.saveOccurrenceInfo(updated);
        await offlineOccurrenceQueueRepo.addAction("ADD_INTERVENOR", payload);
      }
    },
    [isOnline, user, t, occurrence, checkIfIntervenorIsInOccurrence],
  );

  const removeIntervenorFromOccurrence = useCallback(
    async (intervenorId: number, occurrenceId: number) => {
      if (isOnline) {
        try {
          if (!user) return;
          await api.removeIntervenor({ intervenorId }, occurrenceId);
          const response = await api.findOccurrencesByReporterId(user.id);
          setOccurrence(response);
        } catch (err: any) {
          throw Error(err.message);
        }
        return;
      } else {
        const intervenors = await intervenorInfoRepo.getIntervenorInfo();
        const intervenor = intervenors?.find((i) => i.id === intervenorId);
        if (!intervenor) throw Error(t("errorResponse.intervenorNotFound"));
        const payload = { intervenor: intervenor, occurrenceId: occurrenceId };
        const updated = occurrence.map((o) => {
          if (o.id === occurrenceId) {
            return {
              ...o,
              intervenors: o.intervenors.filter((id) => id !== intervenorId),
            };
          }
          return o;
        });
        setOccurrence(updated);
        await occurrenceInfoRepo.saveOccurrenceInfo(updated);
        await offlineOccurrenceQueueRepo.addAction(
          "REMOVE_INTERVENOR",
          payload,
        );
      }
    },
    [isOnline, user, t, occurrence],
  );

  useEffect(() => {
    if (user) {
      if (isOnline) {
        listOccurrences();
      } else {
        loadCachedOccurrences();
      }
    }
  }, [user, isOnline, listOccurrences, loadCachedOccurrences]);

  useEffect(() => {
    const handleOccurrencesChanged = async () => {
      if (!lastEvent) return;
      if (lastEvent?.action === "OccurrencesChanged") {
        setLoading(true);
        const value = lastEvent.data;
        const occurrences: Occurrence[] = Array.isArray(value) ? value : [];
        setOccurrence(occurrences);
        await occurrenceInfoRepo.saveOccurrenceInfo(occurrences);
        const timer = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(timer);
      }
    };

    handleOccurrencesChanged();
  }, [lastEvent]);

  const value = useMemo(
    () => ({
      listOccurrences,
      occurrence,
      getOccurrence,
      addIntervenorToOccurrence,
      removeIntervenorFromOccurrence,
      loading,
    }),
    [
      listOccurrences,
      occurrence,
      getOccurrence,
      addIntervenorToOccurrence,
      removeIntervenorFromOccurrence,
      loading,
    ],
  );

  return (
    <OccurrenceContext.Provider value={value}>
      {children}
    </OccurrenceContext.Provider>
  );
}
