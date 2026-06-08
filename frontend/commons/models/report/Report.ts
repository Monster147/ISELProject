import type { Json } from "../utils/Json";
import type { ReportStatus } from "./ReportStatus";

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

