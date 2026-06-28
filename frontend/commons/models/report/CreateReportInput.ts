import { Json } from "../utils/Json";

/**
 * Dados para criar um novo relatório.
 * @property creatorId Identificador do utilizador criador.
 * @property occurrenceId Identificador da ocorrência associada.
 * @property title Título do relatório.
 * @property description Descrição ou sumário.
 * @property addons Dados adicionais em JSON.
 * @property language Código de linguagem (ex: "pt", "en", "es").
 */
export interface CreateReportInput {
  creatorId: number;
  occurrenceId: number;
  title: string;
  description: string;
  addons: Json;
  language: string;
}
