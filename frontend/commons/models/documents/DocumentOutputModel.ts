/**
 * Modelo de output retornado pela API ao consultar um documento.
 * @property id Identificador único do documento.
 * @property name Nome do documento.
 * @property type Tipo do documento.
 * @property filepath Caminho do ficheiro no servidor.
 */
export interface DocumentOutputModel {
  id: number;
  name: string;
  type: string;
  filepath: string;
}
