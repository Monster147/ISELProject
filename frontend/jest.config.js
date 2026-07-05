const mocks = "<rootDir>/__tests__/mocks";

const singletons = {
  "^react$": "<rootDir>/node_modules/react",
  "^react/jsx-runtime$": "<rootDir>/node_modules/react/jsx-runtime",
  "^react/jsx-dev-runtime$": "<rootDir>/node_modules/react/jsx-dev-runtime",
  "^react-test-renderer$": "<rootDir>/node_modules/react-test-renderer",
  "^react-native$": "<rootDir>/node_modules/react-native",
};

const commonAlias = {
  "^@commons/(.*)$": "<rootDir>/commons/$1",
  "^i18next$": `${mocks}/i18next.js`,
  "^react-i18next$": `${mocks}/react-i18next.js`,
  ...singletons,
};

module.exports = {
  projects: [
    {
      displayName: "commons",
      preset: "jest-expo",
      rootDir: __dirname,
      roots: ["<rootDir>/commons", "<rootDir>/__tests__/commons"],
      testMatch: ["<rootDir>/__tests__/commons/**/*.test.{ts,tsx}"],
      setupFilesAfterEnv: ["<rootDir>/__tests__/jest.setup.js"],
      moduleNameMapper: {
        ...commonAlias,
      },
    },
    {
      displayName: "desktop",
      preset: "jest-expo",
      rootDir: __dirname,
      testEnvironment: "jsdom",
      roots: [
        "<rootDir>/desktop",
        "<rootDir>/commons",
        "<rootDir>/__tests__/desktop",
      ],
      testMatch: ["<rootDir>/__tests__/desktop/**/*.test.{ts,tsx}"],
      setupFilesAfterEnv: ["<rootDir>/__tests__/jest.setup.js"],
      moduleNameMapper: {
        "^@components/(.*)$": "<rootDir>/desktop/components/$1",
        "^@contexts/(.*)$": "<rootDir>/desktop/contexts/$1",
        "^@hooks/(.*)$": "<rootDir>/desktop/hooks/$1",
        "^@infrastructure/(.*)$": "<rootDir>/desktop/infrastructure/$1",
        "^@utils/(.*)$": "<rootDir>/desktop/utils/$1",
        "^react-router$": `${mocks}/react-router.js`,
        "^react-icons/io5$": `${mocks}/react-icons.js`,
        "^react-icons$": `${mocks}/react-icons.js`,
        ...commonAlias,
      },
    },
    {
      displayName: "movel",
      preset: "jest-expo",
      rootDir: __dirname,
      roots: [
        "<rootDir>/movel",
        "<rootDir>/commons",
        "<rootDir>/__tests__/movel",
      ],
      testMatch: ["<rootDir>/__tests__/movel/**/*.test.{ts,tsx}"],
      setupFilesAfterEnv: ["<rootDir>/__tests__/jest.setup.js"],
      moduleNameMapper: {
        "^@components/(.*)$": "<rootDir>/movel/components/$1",
        "^@contexts/(.*)$": "<rootDir>/movel/contexts/$1",
        "^@hooks/(.*)$": "<rootDir>/movel/hooks/$1",
        "^@infrastructure/(.*)$": "<rootDir>/movel/infrastructure/$1",
        "^@utils/(.*)$": "<rootDir>/movel/utils/$1",
        "^expo-router$": `${mocks}/expo-router.js`,
        "^@react-native-community/netinfo$": `${mocks}/netinfo.js`,
        "^@react-native-community/datetimepicker$": `${mocks}/datetimepicker.js`,
        "^@expo/vector-icons$": `${mocks}/expo-vector-icons.js`,
        "^react-native-safe-area-context$": `${mocks}/safe-area-context.js`,
        "^expo-secure-store$": `${mocks}/secure-store.js`,
        "^@react-native-async-storage/async-storage$": `${mocks}/async-storage.js`,
        "^react-native-sse$": `${mocks}/react-native-sse.js`,
        "^react-native-blob-util$": `${mocks}/blob-util.js`,
        ...commonAlias,
      },
    },
  ],
};
