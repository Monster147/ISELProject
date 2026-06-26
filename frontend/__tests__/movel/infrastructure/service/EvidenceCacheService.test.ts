import ReactNativeBlobUtil from "react-native-blob-util";
import { EvidenceCacheService } from "@infrastructure/service/EvidenceCacheService";

const fs = (ReactNativeBlobUtil as any).fs;
const Blob = ReactNativeBlobUtil as unknown as { __reset: () => void };

const CACHE_DIR = "/cache/evidence-cache";

beforeEach(() => Blob.__reset());

describe("EvidenceCacheService", () => {
  let service: EvidenceCacheService;
  beforeEach(() => {
    service = new EvidenceCacheService();
  });

  describe("init", () => {
    it("creates the cache directory when it does not exist", async () => {
      fs.exists.mockResolvedValueOnce(false);
      await service.init();
      expect(fs.mkdir).toHaveBeenCalledWith(CACHE_DIR);
    });

    it("does not recreate the directory when it already exists", async () => {
      fs.exists.mockResolvedValueOnce(true);
      await service.init();
      expect(fs.mkdir).not.toHaveBeenCalled();
    });
  });

  describe("cacheFile", () => {
    it("copies the source file to a per-evidence destination and returns it", async () => {
      fs.exists.mockResolvedValueOnce(true).mockResolvedValueOnce(true);
      fs.cp.mockResolvedValueOnce(undefined);

      const dest = await service.cacheFile(7, "/tmp/source.jpg", "photo.jpg");

      const expected = `${CACHE_DIR}/7-photo.jpg`;
      expect(fs.cp).toHaveBeenCalledWith("/tmp/source.jpg", expected);
      expect(dest).toBe(expected);
    });

    it("strips any directory prefix from the file name", async () => {
      fs.exists.mockResolvedValue(true);
      fs.cp.mockResolvedValueOnce(undefined);

      const dest = await service.cacheFile(9, "/tmp/x", "nested/dir/img.png");

      expect(dest).toBe(`${CACHE_DIR}/9-img.png`);
    });
  });

  describe("exists", () => {
    it("delegates to the filesystem exists check", async () => {
      fs.exists.mockResolvedValueOnce(true);
      await expect(service.exists("/some/path")).resolves.toBe(true);
      expect(fs.exists).toHaveBeenCalledWith("/some/path");
    });
  });
});
