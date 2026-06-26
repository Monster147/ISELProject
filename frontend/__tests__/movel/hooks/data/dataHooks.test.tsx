import { renderHook } from "@testing-library/react-native";
import { useDocument } from "@hooks/data/useDocument";
import { useEvidence } from "@hooks/data/useEvidence";
import { useIntervenor } from "@hooks/data/useIntervenor";
import { useOccurrence } from "@hooks/data/useOccurrence";
import { useStats } from "@hooks/data/useStats";
import { useType } from "@hooks/data/useType";

const guards = [
  { name: "useDocument", hook: useDocument, message: /DocumentProvider/ },
  { name: "useEvidence", hook: useEvidence, message: /EvidenceProvider/ },
  { name: "useIntervenor", hook: useIntervenor, message: /IntervenorProvider/ },
  { name: "useOccurrence", hook: useOccurrence, message: /OccurrenceProvider/ },
  { name: "useStats", hook: useStats, message: /StatsProvider/ },
  { name: "useType", hook: useType, message: /TypeProvider/ },
];

describe("movel data hook guards", () => {
  it.each(guards)(
    "$name throws when used outside its provider",
    ({ hook, message }) => {
      expect(() => renderHook(() => hook())).toThrow(message);
    },
  );
});
