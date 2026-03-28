import {Json} from "../utils/Json";

export interface CreateEvidenceInput{
    type: Json;
    filePath: string;
    location: string;
    description: string;
    reporterId: number;
    reportId: number;
}