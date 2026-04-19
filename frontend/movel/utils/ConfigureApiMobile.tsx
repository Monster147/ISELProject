import {configureApi} from "@commons/api/api";
import {authInfoRepo} from "../infrastructure/AuthInfoPreferencesRepo";
import {getErrorDescription} from "../errors/ErrorDescriptions";
import * as FileSystem from 'expo-file-system/legacy';
import {
    DOCUMENT_DIR,
    ensureDirExists,
    getExtensionFromMime,
    getFilePath,
    resolveMimeType
} from "./ConfigureApiMobileUtils";
import {Platform} from "react-native";
import ReactNativeBlobUtil from 'react-native-blob-util'

configureApi(
    {
        getAuthInfo: () => authInfoRepo.getAuthInfo(),
        getErrorDescription: getErrorDescription,
        documentDownloadHandler: downloadDocument,
    },
    "https://unfabricated-everett-surveyable.ngrok-free.dev/api",
);

export async function downloadDocument(apiBaseUrl: string, id: number): Promise<void> {
    /*const url = `${apiBaseUrl}/documents/${id}/download`;

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
        const path = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${filename}`;

        const res = await ReactNativeBlobUtil.config({
            fileCache: true,
            path: path,
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
        return;
    }

    const path = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${filename}`;

    const res = await ReactNativeBlobUtil.config({
        fileCache: true,
        path: path,
    }).fetch("GET", url);

    console.log("Guardado em iOS:", res.path());*/
}

