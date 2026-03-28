import {Json} from "../utils/Json";

export interface CreateReportInput{
    creatorId: number;
    title: string;
    description: string;
    type: Json;
    addons: Json;
}