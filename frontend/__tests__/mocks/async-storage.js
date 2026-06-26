// In-memory mock for @react-native-async-storage/async-storage.
// Backed by a Map so the preference repos can round-trip values in tests.
const store = new Map();

const AsyncStorage = {
  setItem: jest.fn(async (key, value) => {
    store.set(key, String(value));
  }),
  getItem: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
  removeItem: jest.fn(async (key) => {
    store.delete(key);
  }),
  clear: jest.fn(async () => {
    store.clear();
  }),
  getAllKeys: jest.fn(async () => Array.from(store.keys())),
  // Test helper: wipe data + call history between tests.
  __reset: () => {
    store.clear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.getItem.mockClear();
    AsyncStorage.removeItem.mockClear();
    AsyncStorage.clear.mockClear();
  },
};

module.exports = { __esModule: true, default: AsyncStorage };
