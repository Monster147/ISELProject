require("@testing-library/react-native");

const originalWarn = console.warn;
jest.spyOn(console, "warn").mockImplementation((...args) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  if (msg.includes("useNativeDriver")) return;
  originalWarn(...args);
});
