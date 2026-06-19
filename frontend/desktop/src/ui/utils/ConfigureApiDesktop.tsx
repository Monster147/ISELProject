import { configureApi } from "@commons/api/api";
import { authInfoRepo } from "../infrastructure/AuthInfoPreferencesRepo";

configureApi(
  {
    getAuthInfo: () => authInfoRepo.getAuthInfo(),
    documentDownloadHandler: downloadDocument,
    evidenceDownloadHandler: downloadEvidence,
  },
  "/api",
);

async function downloadDocument(apiBaseUrl: string, id: number): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/documents/${id}/download`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Erro ao fazer download");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition");
  const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] ?? "download";

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

async function downloadEvidence(
  apiBaseUrl: string,
  id: number,
  authHeaders: HeadersInit,
  keep: boolean,
): Promise<Blob> {
  const response = await fetch(`${apiBaseUrl}/evidence/${id}/download`, {
    headers: authHeaders,
  });
  return await response.blob();
}
