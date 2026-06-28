import type { Json } from "../utils/Json";
import type { ReportStatus } from "./ReportStatus";

/**
 * Representa um relatório gerado a partir de uma ocorrência.
 * @property id Identificador único.
 * @property creatorId Identificador do criador.
 * @property title Título.
 * @property description Descrição.
 * @property status Estado atual no ciclo de vida.
 * @property type Identificador do tipo de ocorrência.
 * @property addons Dados adicionais em JSON.
 * @property createdAt Timestamp de criação (epoch millis).
 * @property updatedAt Timestamp da última atualização (epoch millis).
 * @property editors IDs dos utilizadores com permissão de edição.
 * @property intervenors IDs dos intervenientes associados.
 * @property language Código de linguagem do relatório.
 * @property filePath Caminho do ficheiro PDF no servidor.
 */
export interface Report {
  id: number;
  creatorId: number;
  title: string;
  description: string;
  status: ReportStatus;
  type: number;
  addons: Json;
  createdAt: number;
  updatedAt: number;
  editors: number[];
  intervenors: number[];
  language: string;
  filePath: string;
}
