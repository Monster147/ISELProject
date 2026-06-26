import { renderHook } from "@testing-library/react-native";
import EventSource from "react-native-sse";
import { useReportListener } from "@hooks/listeners/useReportListener";

const FakeES = EventSource as unknown as {
  last: any;
  reset: () => void;
  instances: any[];
};

beforeEach(() => FakeES.reset());

describe("movel useReportListener", () => {
  it("does not connect when disabled", () => {
    renderHook(() => useReportListener("5", jest.fn(), false));
    expect(FakeES.instances).toHaveLength(0);
  });

  it("does not connect without a report id", () => {
    renderHook(() => useReportListener(undefined, jest.fn(), true));
    expect(FakeES.instances).toHaveLength(0);
  });
});
