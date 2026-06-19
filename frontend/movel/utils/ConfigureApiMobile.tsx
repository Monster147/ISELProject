import { configureApi } from "@commons/api/api";
import { authInfoRepo } from "@infrastructure/AuthInfoPreferencesRepo";
import ReactNativeBlobUtil from "react-native-blob-util";
import { Platform, Alert } from "react-native";
import { getExtensionFromMime } from "./ConfigureApiMobileUtils";
import { API_URL } from "@commons/constants/apiurl";

configureApi(
  {
    getAuthInfo: () => authInfoRepo.getAuthInfo(),
    documentDownloadHandler: downloadDocument,
    evidenceDownloadHandler: downloadEvidence,
  },
  `${API_URL}/api`,
);

async function downloadDocument(apiBaseUrl: string, id: number): Promise<void> {
  const url = `${apiBaseUrl}/documents/${id}/download`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao ir buscar as informações do documento");
  }

  const contentDisposition = response.headers.get("content-disposition");
  const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);

  let filename = filenameMatch?.[1] ?? `document_${id}`;

  const mime = response.headers.get("content-type");

  if (!filename.includes(".")) {
    filename += getExtensionFromMime(mime);
  }

  if (Platform.OS === "android") {
    const res = await ReactNativeBlobUtil.config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        title: filename,
        description: "A transferir ficheiro...",
        path: `/storage/emulated/0/Download/${filename}`,
        mime: mime || "application/octet-stream",
        mediaScannable: true,
      },
    }).fetch("GET", url);

    console.log("Guardado em:", res.path());
    Alert.alert(
      "Download concluído",
      "O ficheiro foi guardado na pasta Downloads.",
    );
    return;
  }

  const path = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${filename}`;

  const res = await ReactNativeBlobUtil.config({
    fileCache: true,
    path: path,
  }).fetch("GET", url);

  console.log("Guardado em iOS:", res.path());
}

const LOG_PREFIX = "[EVIDENCES DOWNLOAD]";

export const log = (...args: any[]) => console.log(LOG_PREFIX, ...args);

const logError = (...args: any[]) => console.error(LOG_PREFIX, ...args);

async function downloadEvidence(
  apiBaseUrl: string,
  id: number,
  authHeaders: HeadersInit,
  keep: Boolean,
): Promise<any> {
  const url = `${apiBaseUrl}/evidence/${id}/download`;
  if (keep) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erro ao ir buscar as informações do documento");
    }

    const contentDisposition = response.headers.get("content-disposition");
    const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);

    let filename = filenameMatch?.[1] ?? `evidence_${id}`;

    const mime = response.headers.get("content-type");

    const customPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${filename}`;
    log("CUSTOM PATH", customPath);

    if (!filename.includes(".")) {
      filename += getExtensionFromMime(mime);
    }

    if (Platform.OS === "android") {
      const res = await ReactNativeBlobUtil.config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: filename,
          description: "A transferir ficheiro...",
          path: `/storage/emulated/0/Download/${filename}`,
          mime: mime || "application/octet-stream",
          mediaScannable: true,
        },
      }).fetch("GET", url, authHeaders as Record<string, string>);

      console.log("Guardado em:", res.path());
      Alert.alert(
        "Download concluído",
        "O ficheiro foi guardado na pasta Downloads.",
      );
      return;
    }

    const path = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${filename}`;

    const res = await ReactNativeBlobUtil.config({
      fileCache: true,
      path: path,
    }).fetch("GET", url, authHeaders as Record<string, string>);

    console.log("Guardado em iOS:", res.path());
  } else {
    return ReactNativeBlobUtil.config({
      fileCache: true,
    }).fetch("GET", url, authHeaders as Record<string, string>);
  }
}
