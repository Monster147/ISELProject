/**
 * Retorna a extensão de ficheiro correspondente a um tipo MIME.
 * Útil para construir nomes de ficheiro quando o servidor não os fornece na resposta.
 *
 * @param mime Tipo MIME do ficheiro (ex: "application/pdf", "image/jpeg").
 * @returns Extensão com ponto (ex: ".pdf", ".jpg"), ou string vazia se o MIME não for reconhecido.
 */
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
