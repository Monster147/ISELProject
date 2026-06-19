import { Json } from "../utils/Json";

export interface CreateReportInput {
  creatorId: number;
  occurrenceId: number;
  title: string;
  description: string;
  addons: Json;
  language: string;
}
