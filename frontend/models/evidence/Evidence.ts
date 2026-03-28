import type { Json } from "../utils/Json";

export interface Evidence {
    id: number;
    type: Json;
    filePath: string;
    location: string;
    description: string;
    reporterId: number;
    reportId: number;
    createdAt: number;
    updatedAt: number;
}

