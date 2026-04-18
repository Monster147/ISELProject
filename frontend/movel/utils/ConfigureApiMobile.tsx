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

configureApi(
    {
        getAuthInfo: () => authInfoRepo.getAuthInfo(),
        getErrorDescription: getErrorDescription,
        documentDownloadHandler: downloadDocument,
    },
    "https://unfabricated-everett-surveyable.ngrok-free.dev/api",
);

export async function downloadDocument(apiBaseUrl: string, id: number): Promise<void> {
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

    await ensureDirExists(DOCUMENT_DIR);
    const fileUri = getFilePath(filename);

    const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri
    );

    const result = await downloadResumable.downloadAsync();
    if (!result?.uri) {
        throw new Error("Download falhou");
    }

    if (Platform.OS === "android") {
        const permission =
            await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permission.granted) {
            console.log("User cancelou → fallback");
            return;
        }

        const dirUri = permission.directoryUri;

        const mimeType = resolveMimeType(
            filename,
            result.headers["content-type"]
        );

        const newFileUri =
            await FileSystem.StorageAccessFramework.createFileAsync(
                dirUri,
                filename,
                mimeType
            );

        const base64 = await FileSystem.readAsStringAsync(result.uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        await FileSystem.writeAsStringAsync(newFileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
        });
    }
}

