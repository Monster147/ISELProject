// Mock for `react-native-sse` (default export EventSource), used by the movel
// SSE listeners. Unlike the browser EventSource, this one uses the
// addEventListener("message"|"error", cb) API and removeAllEventListeners().
class FakeEventSource {
  static instances = [];

  constructor(url) {
    this.url = url;
    this.listeners = {};
    this.closed = false;
    this.removedAll = false;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type, cb) {
    (this.listeners[type] = this.listeners[type] || []).push(cb);
  }

  removeAllEventListeners() {
    this.removedAll = true;
    this.listeners = {};
  }

  close() {
    this.closed = true;
  }

  // Test helpers ----------------------------------------------------------
  emit(payload) {
    (this.listeners["message"] || []).forEach((cb) =>
      cb({ data: JSON.stringify(payload) }),
    );
  }

  emitRaw(data) {
    (this.listeners["message"] || []).forEach((cb) => cb({ data }));
  }

  emitError(event = { type: "error" }) {
    (this.listeners["error"] || []).forEach((cb) => cb(event));
  }

  static get last() {
    return FakeEventSource.instances[FakeEventSource.instances.length - 1];
  }

  static reset() {
    FakeEventSource.instances = [];
  }
}

module.exports = { __esModule: true, default: FakeEventSource };
