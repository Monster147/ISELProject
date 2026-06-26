const React = require("react");

const SafeAreaView = (props) => React.createElement("SafeAreaView", props);
const SafeAreaProvider = ({ children }) =>
  React.createElement(React.Fragment, null, children);

module.exports = {
  __esModule: true,
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  SafeAreaInsetsContext: React.createContext({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
};
