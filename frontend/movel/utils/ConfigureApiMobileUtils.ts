import * as FileSystem from "expo-file-system/legacy";

export const DOCUMENT_DIR = FileSystem.documentDirectory;

export async function ensureDirExists(dir: string | null) {
    if (dir != null) {
        const info = await FileSystem.getInfoAsync(dir);
        if (!info.exists) {
            await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        }
    }
}

export function getFilePath(filename: string) {
    return DOCUMENT_DIR + filename;
}

export function resolveMimeType(filename: string, headerMime?: string): string {
    if (headerMime && headerMime !== "application/octet-stream") {
        return headerMime;
    }

    const ext = filename.split(".").pop()?.toLowerCase();

    switch (ext) {
        case "pdf":
            return "application/pdf";
        case "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case "doc":
            return "application/msword";
        case "msg":
            return "application/vnd.ms-outlook";
        case "png":
            return "image/png";
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        default:
            return "application/octet-stream";
    }
}

export function getExtensionFromMime(mime?: string | null): string {
    switch (mime) {
        case "application/pdf":
            return ".pdf";
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return ".docx";
        case "application/msword":
            return ".doc";
        case "application/vnd.ms-outlook":
            return ".msg";
        case "image/png":
            return ".png";
        case "image/jpeg":
            return ".jpg";
        default:
            return "";
    }
}
