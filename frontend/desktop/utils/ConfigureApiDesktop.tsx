import { configureApi } from "@commons/api/api";
import { authInfoRepo } from "@infrastructure/AuthInfoPreferencesRepo";

/**
 * Configura o módulo de API com os handlers específicos da aplicação desktop.
 * Deve ser chamado uma única vez no arranque da aplicação, antes de qualquer chamada à API.
 * Usa `/api` como URL base, aproveitando o proxy do Next.js para evitar problemas de CORS.
 */
configureApi(
  {
    getAuthInfo: () => authInfoRepo.getAuthInfo(),
    documentDownloadHandler: downloadDocument,
    evidenceDownloadHandler: downloadEvidence,
  },
  "/api",
);

/**
 * Handler de download de documentos para a plataforma web.
 * Faz fetch do ficheiro, extrai o nome do cabeçalho `content-disposition`
 * e desencadeia o download criando um link `<a>` temporário no DOM,
 * clicando-o programaticamente e revogando o URL do blob após o download.
 *
 * @param apiBaseUrl URL base da API.
 * @param id Identificador do documento a descarregar.
 * @throws {Error} Se a resposta HTTP não for bem-sucedida.
 */
async function downloadDocument(apiBaseUrl: string, id: number): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/documents/${id}/download`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Erro ao fazer download");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition");
  const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] ?? "download";

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Handler de download de evidências para a aplicação desktop.
 * Faz fetch do ficheiro com os cabeçalhos de autenticação e retorna o Blob resultante.
 *
 * @param apiBaseUrl URL base da API.
 * @param id Identificador da evidência a descarregar.
 * @param authHeaders Cabeçalhos de autenticação a incluir no pedido.
 * @param keep Parâmetro de compatibilidade de interface (sem efeito nesta aplicação).
 * @returns Blob com o conteúdo do ficheiro da evidência.
 */
async function downloadEvidence(
  apiBaseUrl: string,
  id: number,
  authHeaders: HeadersInit,
  keep: boolean,
): Promise<Blob> {
  const response = await fetch(`${apiBaseUrl}/evidence/${id}/download`, {
    headers: authHeaders,
  });
  return await response.blob();
}
