/**
 * Representa um ficheiro a enviar para a API,  com variantes por plataforma.
 *
 * - Na plataforma desktop, usa um objeto `File` nativo do browser.
 * - Na plataforma móvel, usa um URI local (ex: obtido pelo image picker do Expo).
 */
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
