const React = require("react");

const navigateMock = jest.fn();

module.exports = {
  __esModule: true,
  // Same fn instance every render, but tests can read/reset it.
  useNavigate: () => navigateMock,
  __navigateMock: navigateMock,
  Link: ({ children }) => React.createElement(React.Fragment, null, children),
  Navigate: () => null,
  Outlet: () => null,
};
