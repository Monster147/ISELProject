import {
  api,
  fetchApi,
  getAuthHeaders,
  configureApi,
  ApiError,
} from "@commons/api/api";
import { jsonResponse, mockToken, mockUserHome } from "../../mocks/mockData";

const BASE_URL = "https://api.test";

const fetchMock = jest.fn();

beforeAll(() => {
  global.fetch = fetchMock as unknown as typeof fetch;
});

beforeEach(() => {
  fetchMock.mockReset();
  configureApi(
    { getAuthInfo: async () => ({ token: mockToken.token }) },
    BASE_URL,
  );
});

describe("getAuthHeaders", () => {
  it("builds a Bearer Authorization header from the configured token", async () => {
    await expect(getAuthHeaders()).resolves.toEqual({
      Authorization: `Bearer ${mockToken.token}`,
    });
  });

  it("returns an empty object when there is no token", async () => {
    configureApi({ getAuthInfo: async () => null }, BASE_URL);
    await expect(getAuthHeaders()).resolves.toEqual({});
  });
});

describe("fetchApi", () => {
  it("prefixes the base url and sets the JSON content-type", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: 1 }));

    const result = await fetchApi<{ ok: number }>("/ping");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/ping`);
    expect(options.headers).toMatchObject({
      "Content-Type": "application/json",
    });
    expect(result).toEqual({ ok: 1 });
  });

  it("does not set a JSON content-type for FormData bodies", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}));

    await fetchApi("/upload", { method: "POST", body: new FormData() });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("returns undefined body for a 204 No Content response", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, { status: 204 }));
    await expect(fetchApi("/empty")).resolves.toBeUndefined();
  });

  it("returns undefined body when Content-Length is 0", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(null, { headers: { "Content-Length": "0" } }),
    );
    await expect(fetchApi("/empty")).resolves.toBeUndefined();
  });

  it("throws an ApiError carrying the translated error title", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ title: "user-not-found" }, { ok: false, status: 404 }),
    );

    expect.assertions(3);
    try {
      await fetchApi("/user/999");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
      expect((err as ApiError).message).toBe("errorResponse.userNotFound");
    }
  });
});

describe("api endpoints", () => {
  it("createToken POSTs to /user/token with the serialized body", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(mockToken));

    const input = { email: "ada@example.com", password: "secret" } as any;
    const result = await api.createToken(input);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/user/token`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual(input);
    expect(result).toEqual(mockToken);
  });

  it("userHome GETs /user/me with the auth header", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(mockUserHome));

    const result = await api.userHome();

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/user/me`);
    expect(options.headers).toMatchObject({
      Authorization: `Bearer ${mockToken.token}`,
    });
    expect(result).toEqual(mockUserHome);
  });

  it("findIntervenorById builds the id path", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 10 }));
    await api.findIntervenorById(10);
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/intervenor/10`);
    expect(fetchMock.mock.calls[0][1].method).toBe("GET");
  });

  it("deleteReportById issues a DELETE", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, { status: 204 }));
    await api.deleteReportById(5);
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/report/5`);
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
  });
});
