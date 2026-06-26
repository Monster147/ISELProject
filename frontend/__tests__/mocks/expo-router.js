const React = require("react");

const replaceMock = jest.fn();
const pushMock = jest.fn();
const backMock = jest.fn();

const router = {
  replace: replaceMock,
  push: pushMock,
  back: backMock,
  navigate: jest.fn(),
};

// useFocusEffect runs the provided effect callback once and stores its cleanup
// so tests can drive focus/blur. The standalone `router` mirrors useRouter().
let focusCleanup;
const useFocusEffect = (cb) => {
  const ReactLib = require("react");
  ReactLib.useEffect(() => {
    focusCleanup = cb();
    return () => {
      if (typeof focusCleanup === "function") focusCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

module.exports = {
  __esModule: true,
  useRouter: () => router,
  router,
  __router: router,
  __replaceMock: replaceMock,
  __pushMock: pushMock,
  useFocusEffect,
  useLocalSearchParams: () => ({}),
  usePathname: () => "/",
  Link: ({ children }) => React.createElement(React.Fragment, null, children),
  Stack: () => null,
  Slot: () => null,
  Redirect: () => null,
};
