// Mock for `react-native-blob-util` (default export), used by
// EvidenceCacheService for filesystem operations.
const fs = {
  dirs: { CacheDir: "/cache", DocumentDir: "/documents" },
  exists: jest.fn(),
  mkdir: jest.fn(),
  cp: jest.fn(),
  unlink: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
};

const ReactNativeBlobUtil = {
  fs,
  config: jest.fn(() => ReactNativeBlobUtil),
  fetch: jest.fn(),
  __reset: () => {
    Object.values(fs).forEach((v) => {
      if (typeof v === "function" && v.mockReset) v.mockReset();
    });
  },
};

module.exports = { __esModule: true, default: ReactNativeBlobUtil };
