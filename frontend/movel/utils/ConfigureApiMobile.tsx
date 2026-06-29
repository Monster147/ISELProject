import { configureApi } from "@commons/api/api";
import { authInfoRepo } from "@infrastructure/AuthInfoPreferencesRepo";
import ReactNativeBlobUtil from "react-native-blob-util";
import { Platform, Alert } from "react-native";
import { getExtensionFromMime } from "./ConfigureApiMobileUtils";
import { API_URL } from "@commons/constants/apiurl";

/**
 * Configura o módulo de API com os handlers específicos da plataforma móvel.
 * Deve ser chamado uma única vez no arranque da aplicação, antes de qualquer chamada à API.
 * Usa `${API_URL}/api` como URL base para ligar diretamente ao backend.
 */
configureApi(
  {
    getAuthInfo: () => authInfoRepo.getAuthInfo(),
    documentDownloadHandler: downloadDocument,
    evidenceDownloadHandler: downloadEvidence,
  },
  `${API_URL}/api`,
);

/**
 * Handler de download de documentos para a plataforma móvel.
 * Extrai o nome e o tipo MIME do ficheiro a partir dos cabeçalhos da resposta,
 * inferindo a extensão via {@link getExtensionFromMime} caso o nome não a inclua.
 * - Android: usa o DownloadManager do sistema, guardando na pasta Downloads
 *   com notificação nativa e alerta de confirmação ao utilizador.
 * - iOS: guarda o ficheiro no DocumentDir da aplicação via ReactNativeBlobUtil.
 *
 * @param apiBaseUrl URL base da API.
 * @param id Identificador do documento a descarregar.
 * @throws {Error} Se a resposta HTTP não for bem-sucedida.
 */
async function downloadDocument(apiBaseUrl: string, id: number): Promise<void> {
  const url = `${apiBaseUrl}/documents/${id}/download`;

  const response = await fetch(url, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
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
    }).fetch("GET", url, { "ngrok-skip-browser-warning": "true" });

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
  }).fetch("GET", url, { "ngrok-skip-browser-warning": "true" });
}

/**
 * Handler de download de evidências para a plataforma móvel.
 * O comportamento varia consoante o parâmetro `keep`:
 * - `keep = true`: guarda o ficheiro permanentemente no dispositivo.
 *   Extrai o nome e o tipo MIME dos cabeçalhos, inferindo a extensão via {@link getExtensionFromMime}.
 *   No Android, usa o DownloadManager com notificação nativa e alerta de confirmação.
 *   No iOS, guarda no DocumentDir da aplicação.
 * - `keep = false`: descarrega o ficheiro para cache temporária e retorna o objeto
 *   ReactNativeBlobUtil, permitindo o uso imediato do ficheiro (ex: visualização).
 *
 * @param apiBaseUrl URL base da API.
 * @param id Identificador da evidência a descarregar.
 * @param authHeaders Cabeçalhos de autenticação a incluir no pedido.
 * @param keep Se true, guarda o ficheiro permanentemente; se false, retorna o objeto temporário.
 * @returns Void quando `keep` é true, ou objeto ReactNativeBlobUtil quando `keep` é false.
 * @throws {Error} Se `keep` for true e a resposta HTTP não for bem-sucedida.
 */
async function downloadEvidence(
  apiBaseUrl: string,
  id: number,
  authHeaders: HeadersInit,
  keep: Boolean,
): Promise<any> {
  const url = `${apiBaseUrl}/evidence/${id}/download`;
  const headers = {
    ...(authHeaders as Record<string, string>),
    "ngrok-skip-browser-warning": "true"
  };
  if (keep) {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error("Erro ao ir buscar as informações do documento");
    }

    const contentDisposition = response.headers.get("content-disposition");
    const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);

    let filename = filenameMatch?.[1] ?? `evidence_${id}`;

    const mime = response.headers.get("content-type");

    const customPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${filename}`;

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
      }).fetch("GET", url, headers);

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
    }).fetch("GET", url, headers);
  } else {
    return ReactNativeBlobUtil.config({
      fileCache: true,
    }).fetch("GET", url, headers);
  }
}
