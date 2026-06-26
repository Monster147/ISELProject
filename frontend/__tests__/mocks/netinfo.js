const unsubscribe = jest.fn();
let listener = null;

const NetInfo = {
  addEventListener: jest.fn((cb) => {
    listener = cb;
    return unsubscribe;
  }),
  fetch: jest.fn(() =>
    Promise.resolve({ isConnected: true, isInternetReachable: true }),
  ),
  __emit: (state) => listener && listener(state),
  __unsubscribe: unsubscribe,
  __reset: () => {
    listener = null;
    unsubscribe.mockClear();
    NetInfo.addEventListener.mockClear();
  },
};

module.exports = {
  __esModule: true,
  default: NetInfo,
};
