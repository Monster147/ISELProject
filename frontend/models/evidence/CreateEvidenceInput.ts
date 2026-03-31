import {Json} from "../utils/Json";

export interface CreateEvidenceInput{
    type: Json;
    location: string;
    description: string;
    reporterId: number;
    reportId: number;
}