/**
 * Modelo de input para criação de um documento no sistema.
 * @property name Nome do documento.
 * @property type Tipo do documento (ex: "contrato", "ata").
 */
export interface DocumentInputModel {
  name: string;
  type: string;
}
