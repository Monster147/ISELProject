export type UploadFile =
  | {
      platform: "web";
      file: File;
      name: string;
      type: string;
    }
  | {
      platform: "mobile";
      uri: string;
      name: string;
      type: string;
    };
