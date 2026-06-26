import type { User } from "@commons/models/user/User";
import type { UserHomeOutputModel } from "@commons/models/user/UserHomeOutputModel";
import type { UserCreateTokenOutputModel } from "@commons/models/user/UserCreateTokenOutputModel";
import type { Evidence } from "@commons/models/evidence/Evidence";
import type { Intervenor } from "@commons/models/intervenor/Intervenor";

export const mockUser: User = {
  id: 1,
  name: "Ada Lovelace",
  email: "ada@example.com",
  roles: [1, 2],
};

export const mockUserHome: UserHomeOutputModel = {
  id: 1,
  name: "Ada Lovelace",
  email: "ada@example.com",
  roles: [1, 2],
};

export const mockToken: UserCreateTokenOutputModel = {
  token: "test-token-abc123",
};

export const mockIntervenor: Intervenor = {
  id: 10,
  idNumber: "123456789",
  idType: "CC",
  name: "John Doe",
  contactInfo: "john@example.com",
  address: "Rua das Flores, 1, Lisboa",
};

export const mockEvidence: Evidence = {
  id: 7,
  type: { kind: "photo" },
  filePath: "/files/evidence-7.jpg",
  location: "38.7223,-9.1393",
  description: "Front bumper damage",
  reporterId: 1,
  occurrenceId: 42,
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_500_000,
};

export const mockEvidences: Evidence[] = [
  mockEvidence,
  {
    ...mockEvidence,
    id: 8,
    filePath: "/files/evidence-8.jpg",
    description: "Rear door scratch",
  },
];

export function jsonResponse(
  body: unknown,
  {
    ok = true,
    status = 200,
    headers = {},
  }: Partial<{
    ok: boolean;
    status: number;
    headers: Record<string, string>;
  }> = {},
): Response {
  const headerMap = new Map(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]),
  );
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    headers: {
      get: (name: string) => headerMap.get(name.toLowerCase()) ?? null,
    },
    json: async () => body,
  } as unknown as Response;
}
