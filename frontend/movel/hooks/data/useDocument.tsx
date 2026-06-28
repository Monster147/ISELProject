import { useContext } from "react";
import { DocumentContext } from "@contexts/DocumentContext";

/**
 * Hook que dá acesso ao contexto de documentos na aplicação móvel.
 * Deve ser usado num {@link DocumentProvider}.
 *
 * @returns Contexto de documentos com a lista e operações de CRUD e download.
 * @throws {Error} Se usado fora de um DocumentProvider.
 */
export function useDocument() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within DocumentProvider");
  }
  return context;
}
