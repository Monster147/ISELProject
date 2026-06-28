import type { Json } from "../utils/Json";

/**
 * Representa uma evidência associada a uma ocorrência.
 * @property id Identificador único.
 * @property type Tipo em formato JSON.
 * @property filePath Caminho do ficheiro no servidor.
 * @property location Localização associada.
 * @property description Descrição.
 * @property reporterId Identificador do utilizador que a registou.
 * @property occurrenceId Identificador da ocorrência.
 * @property createdAt Timestamp de criação (epoch millis).
 * @property updatedAt Timestamp da última atualização (epoch millis).
 */
export interface Evidence {
  id: number;
  type: Json;
  filePath: string;
  location: string;
  description: string;
  reporterId: number;
  occurrenceId: number;
  createdAt: number;
  updatedAt: number;
}
