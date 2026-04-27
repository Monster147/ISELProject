import {configureApi} from "@commons/api/api";
import {authInfoRepo} from "../infrastructure/AuthInfoPreferencesRepo";
import {getErrorDescription} from "../errors/ErrorDescriptions";
import * as FileSystem from 'expo-file-system/legacy';
import {Platform} from "react-native";
import {shareAsync} from "expo-sharing";
import {getExtensionFromMime} from "./ConfigureApiMobileUtils";

configureApi(
    {
        getAuthInfo: () => authInfoRepo.getAuthInfo(),
        getErrorDescription: getErrorDescription,
        documentDownloadHandler: downloadDocument,
    },
    "https://unfabricated-everett-surveyable.ngrok-free.dev/api",
);

export async function downloadDocument(apiBaseUrl: string, id: number): Promise<void> {
    const url = `${apiBaseUrl}/documents/${id}/download`
    const response = await fetch(url, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Erro ao fazer download");
    }
    const contentDisposition = response.headers.get("content-disposition")
    const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/)
    const rawFilename = filenameMatch?.[1] ?? "download";
    let fullFilename = rawFilename;

    const mime = response.headers.get("content-type")

    if (!fullFilename.includes(".")) {
        fullFilename += getExtensionFromMime(mime);
    }

    const result = await FileSystem.downloadAsync(url, FileSystem.documentDirectory + fullFilename)

    console.log(result)

    saveFile(result.uri, fullFilename, mime)
}

const saveFile = async (uri, filename, mimetype) => {
    if (Platform.OS === 'android'){
        const permissions= await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
        if (permissions.granted) {
            const base64= await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
            await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, mimetype)
                .then(async (uri) =>{
                    await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 })
                })
                .catch(error => console.log(error))
        }
        else{
            shareAsync(uri)
        }
    } else {
        shareAsync(uri)
    }
}