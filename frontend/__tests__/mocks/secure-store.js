// In-memory mock for expo-secure-store (imported as `* as SecureStore`).
const store = new Map();

const setItemAsync = jest.fn(async (key, value) => {
  store.set(key, String(value));
});
const getItemAsync = jest.fn(async (key) =>
  store.has(key) ? store.get(key) : null,
);
const deleteItemAsync = jest.fn(async (key) => {
  store.delete(key);
});

module.exports = {
  __esModule: true,
  setItemAsync,
  getItemAsync,
  deleteItemAsync,
  // Test helper: wipe data + call history between tests.
  __reset: () => {
    store.clear();
    setItemAsync.mockClear();
    getItemAsync.mockClear();
    deleteItemAsync.mockClear();
  },
};
