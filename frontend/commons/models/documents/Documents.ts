/**
 * Representa um documento armazenado no sistema.
 * @property id Identificador único do documento.
 * @property name Nome do documento.
 * @property type Tipo do documento.
 * @property filepath Caminho do ficheiro no servidor.
 */
export interface Documents {
  id: number;
  name: string;
  type: string;
  filepath: string;
}
