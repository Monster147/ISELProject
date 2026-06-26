// Runs after the test framework is set up, for every project.
// @testing-library/react-native v13 registers its matchers automatically on
// import; importing it here guarantees they are available in every test file.
require("@testing-library/react-native");

const originalWarn = console.warn;
jest.spyOn(console, "warn").mockImplementation((...args) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  if (msg.includes("useNativeDriver")) return;
  originalWarn(...args);
});
