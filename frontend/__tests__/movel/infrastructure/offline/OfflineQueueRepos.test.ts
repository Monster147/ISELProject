import * as SecureStore from "expo-secure-store";
import { offlineEvidenceQueueRepo } from "@infrastructure/offline/OfflineEvidenceQueueRepo";
import { offlineIntervenorQueueRepo } from "@infrastructure/offline/OfflineIntervenorQueueRepo";
import { offlineOccurrenceQueueRepo } from "@infrastructure/offline/OfflineOccurrenceQueueRepo";

const Store = SecureStore as unknown as { __reset: () => void };
beforeEach(() => Store.__reset());

const queues = [
  {
    name: "OfflineEvidenceQueueRepo",
    key: "evidence_offline_queue",
    repo: offlineEvidenceQueueRepo,
    type: "CREATE" as const,
  },
  {
    name: "OfflineIntervenorQueueRepo",
    key: "intervenor_offline_queue",
    repo: offlineIntervenorQueueRepo,
    type: "CREATE" as const,
  },
  {
    name: "OfflineOccurrenceQueueRepo",
    key: "occurrence_offline_queue",
    repo: offlineOccurrenceQueueRepo,
    type: "ADD_INTERVENOR" as const,
  },
];

describe.each(queues)("$name", ({ key, repo, type }) => {
  it("starts with an empty queue", async () => {
    await expect(repo.getQueue()).resolves.toEqual([]);
  });

  it("returns an empty queue when the stored JSON is corrupt", async () => {
    await SecureStore.setItemAsync(key, "not-json{");
    await expect(repo.getQueue()).resolves.toEqual([]);
  });

  it("addAction appends a wrapped action with retry metadata", async () => {
    await repo.addAction(type as any, { foo: "bar" });
    const queue = await repo.getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      type,
      payload: { foo: "bar" },
      retries: 0,
      maxRetries: 5,
    });
    expect(typeof queue[0].id).toBe("string");
  });

  it("removeAction drops the matching action by id", async () => {
    await repo.addAction(type as any, { n: 1 });
    const [action] = await repo.getQueue();
    await repo.removeAction(action.id);
    await expect(repo.getQueue()).resolves.toEqual([]);
  });

  it("updateAction replaces the matching action", async () => {
    await repo.addAction(type as any, { n: 1 });
    const [action] = await repo.getQueue();
    const updated = { ...action, retries: 3 };
    await repo.updateAction(action.id, updated);
    const [stored] = await repo.getQueue();
    expect(stored.retries).toBe(3);
  });

  it("saveQueue persists the whole queue under its key", async () => {
    const q = [
      { id: "1", type, payload: {}, retries: 0, maxRetries: 5 },
    ] as any;
    await repo.saveQueue(q);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      key,
      JSON.stringify(q),
    );
  });

  it("clearQueue removes the stored queue", async () => {
    await repo.addAction(type as any, { n: 1 });
    await repo.clearQueue();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(key);
    await expect(repo.getQueue()).resolves.toEqual([]);
  });
});
