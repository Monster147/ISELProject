import ReactNativeBlobUtil from "react-native-blob-util";
import {log} from "../../utils/ConfigureApiMobile";

export class EvidenceCacheService {
    private CACHE_DIR = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/evidence-cache`;

    async init() {
        const exists =
            await ReactNativeBlobUtil.fs.exists(
                this.CACHE_DIR
            );

        if (!exists) {
            await ReactNativeBlobUtil.fs.mkdir(
                this.CACHE_DIR
            );
        }
    }

    async cacheFile(
        evidenceId: number,
        sourcePath: string,
        fileName: string
    ) {
        await this.init();
        const exists =
            await ReactNativeBlobUtil.fs.exists(
                sourcePath
            );

        const safeFileName = fileName.split("/").pop();
        const destination =
            `${this.CACHE_DIR}/${evidenceId}-${safeFileName}`;

        await ReactNativeBlobUtil.fs.cp(
            sourcePath,
            destination
        );

        return destination;
    }

    async exists(path: string) {
        return ReactNativeBlobUtil.fs.exists(path);
    }
}

export const evidenceCacheService =
    new EvidenceCacheService();