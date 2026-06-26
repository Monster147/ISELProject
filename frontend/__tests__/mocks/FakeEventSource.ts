export class FakeEventSource {
  static instances: FakeEventSource[] = [];

  url: string;
  closed = false;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }

  emit(payload: unknown) {
    this.onmessage?.({ data: JSON.stringify(payload) });
  }

  emitRaw(data: string) {
    this.onmessage?.({ data });
  }

  fail(error: unknown = new Error("sse error")) {
    this.onerror?.(error);
  }

  static get last(): FakeEventSource | undefined {
    return FakeEventSource.instances[FakeEventSource.instances.length - 1];
  }

  static reset() {
    FakeEventSource.instances = [];
  }
}

export function installFakeEventSource(): () => void {
  const original = (global as any).EventSource;
  FakeEventSource.reset();
  (global as any).EventSource =
    FakeEventSource as unknown as typeof EventSource;
  return () => {
    (global as any).EventSource = original;
    FakeEventSource.reset();
  };
}
