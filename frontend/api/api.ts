import {API_BASE_URL} from "./api_base_url";
import {getErrorDescription} from "../errors/ErrorDescriptions";
import {UserInput} from "../models/user/UserInput";
import {UserCreateTokenOutputModel} from "../models/user/UserCreateTokenOutputModel";
import {UserCreateTokenInputModel} from "../models/user/UserCreateTokenInputModel";
import {UserHomeOutputModel} from "../models/user/UserHomeOutputModel";
import {RoleInput} from "../models/role/RoleInput";
import {RolesInput} from "../models/role/RolesInput";
import {ReportTypePercentage} from "../models/report/ReportTypePercentage";
import {Role} from "../models/role/Role";
import {CreateReportInput} from "../models/report/CreateReportInput";
import {IntervenorInput} from "../models/intervenor/IntervenorInput";
import {Intervenor} from "../models/intervenor/Intervenor";
import {IntervenorUpdateInput} from "../models/intervenor/IntervenorUpdateInput";
import {CreateEvidenceInput} from "../models/evidence/CreateEvidenceInput";
import {Evidence} from "../models/evidence/Evidence";
import {Json} from "../models/utils/Json";
import {Report} from "../models/report/Report";
import {authInfoRepo} from "../infrastructure/AuthInfoPreferencesRepo";
import {OccurrenceCreateInput} from "../models/occurrence/OccurrenceCreateInput";
import {OccurrenceType} from "../models/occurrence/OccurrenceType";
import {Occurrence} from "../models/occurrence/Occurrence";

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export async function getAuthHeaders(): Promise<HeadersInit> {
    const authInfo = await authInfoRepo.getAuthInfo();
    const token = authInfo?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ title: "Unknown error" }));
        const errorMessage = error.title
            ? getErrorDescription(error.title)
            : response.statusText;
        throw new ApiError(response.status, errorMessage);
    }

    if (response.status === 204 || response.headers.get("Content-Length") === "0") {
        return undefined as T;
    }

    return response.json();
}

export const api = {
    // Users
    async createUser(input: UserInput): Promise<void> {
        return fetchApi<void>("/user", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async createToken(
        input: UserCreateTokenInputModel
    ): Promise<UserCreateTokenOutputModel> {
        return fetchApi<UserCreateTokenOutputModel>("/user/token", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async logout(): Promise<void> {
        return fetchApi<void>("/user/logout", {
            method: "POST",
            headers: await getAuthHeaders(),
        });
    },

    async userHome(): Promise<UserHomeOutputModel> {
        return fetchApi<UserHomeOutputModel>("/user/me", {
            headers: await getAuthHeaders(),
        });
    },

    async findUserById(): Promise<UserHomeOutputModel> {
        return fetchApi<UserHomeOutputModel>("/user/{userId}", {
            method: "GET",
        });
    },

    async addRole(input: RoleInput): Promise<void>{
        return fetchApi<void>("/user/roles/add", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async removeRole(input: RoleInput): Promise<void>{
        return fetchApi<void>("/user/roles/remove", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async setRoles(input: RolesInput): Promise<void>{
        return fetchApi<void>("/user/roles/remove", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async findUsersByRole(): Promise<UserHomeOutputModel[]>{
        return fetchApi<UserHomeOutputModel[]>("/user/find/role/{roleId}", {
            method: "GET",
        });
    },

    async getPercentages(): Promise<ReportTypePercentage[]>{
        return fetchApi<ReportTypePercentage[]>("/user/percentages/{userId}", {
            method: "GET",
        });
    },

    // Roles

    async createRole(input: string): Promise<void> {
        return fetchApi<void>("/role", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async deleteRole(): Promise<void> {
        return fetchApi<void>("/role/{roleName}", {
            method: "DELETE",
        });
    },

    async findRoleByName(): Promise<Role> {
        return fetchApi<Role>("/role/byName/{roleName}", {
            method: "GET",
        });
    },

    async findRoleById(): Promise<Role> {
        return fetchApi<Role>("/role/byId/{id}", {
            method: "GET",
        });
    },

    async findAllRole(): Promise<Role[]> {
        return fetchApi<Role[]>("/role", {
            method: "GET",
        });
    },

    // Report

    async createReport(input: CreateReportInput): Promise<void> {
        return fetchApi<void>("/report", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async findReportById(): Promise<Report> {
        return fetchApi<Report>("/report/{id}", {
            method: "GET",
        });
    },

    async findAllReports(): Promise<Report[]> {
        return fetchApi<Report[]>("/report/{id}", {
            method: "GET",
        });
    },

    async findByStatus(): Promise<Report[]> {
        return fetchApi<Report[]>("/report/byStatus/{status}", {
            method: "GET",
        });
    },

    async findByCreator(): Promise<Report[]> {
        return fetchApi<Report[]>("/report/byCreator/{creatorId}", {
            method: "GET",
        });
    },

    async deleteReportById(): Promise<void> {
        return fetchApi<void>("/report/{id}", {
            method: "DELETE",
        });
    },

    async updateReportStatus(input: string): Promise<Report> {
        return fetchApi<Report>("/report/update-status/{id}", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async addEditor(input: number): Promise<Report> {
        return fetchApi<Report>("/report/{id}/editors", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async removeEditor(input: number): Promise<Report> {
        return fetchApi<Report>("/report/{id}/editors/", {
            method: "DELETE",
            body: JSON.stringify(input),
        });
    },

    async addIntervenor(input: number): Promise<Report> {
        return fetchApi<Report>("/report/{id}/intervenors", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async removeIntervenor(input: number): Promise<Report> {
        return fetchApi<Report>("/report/{id}/intervenors", {
            method: "DELETE",
            body: JSON.stringify(input),
        });
    },

    // Intervenor

    async createIntervenor(input: IntervenorInput): Promise<void> {
        return fetchApi<void>("/intervenor", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async updateIntervenor(input: IntervenorUpdateInput): Promise<Intervenor> {
        return fetchApi<Intervenor>("/intervenor/update/{intervenorId}", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async deleteIntervenorByIdNumber(): Promise<void> {
        return fetchApi<void>("/intervenor/delete/byIdNumber/{idNumber}", {
            method: "DELETE",
        });
    },

    async findIntervenorByIdNumber(): Promise<Intervenor> {
        return fetchApi<Intervenor>("/intervenor/byIdNumber/{idNumber}", {
            method: "GET",
        });
    },

    async findIntervenorByContactInfo(): Promise<Intervenor> {
        return fetchApi<Intervenor>("/intervenor/byContactInfo/{contactInfo}", {
            method: "GET",
        });
    },

    // Evidence

    async createEvidence(input: CreateEvidenceInput): Promise<void> {
        return fetchApi<void>("/evidence", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async findEvidenceById(): Promise<Evidence> {
        return fetchApi<Evidence>("/evidence/{id}", {
            method: "GET",
        });
    },

    async findEvidenceByReportId(): Promise<Evidence> {
        return fetchApi<Evidence>("/evidence/byReport/{reportId}", {
            method: "GET",
        });
    },

    async findEvidenceByReporterId(): Promise<Evidence> {
        return fetchApi<Evidence>("/evidence/byReporter/{reporterId}", {
            method: "GET",
        });
    },

    async findEvidenceByType(input: Json): Promise<Evidence> {
        return fetchApi<Evidence>("/evidence/byType", {
            method: "GET",
            body: JSON.stringify(input),
        });
    },

    async findEvidenceByLocation(): Promise<Evidence> {
        return fetchApi<Evidence>("/evidence//byLocation/{location}", {
            method: "GET",
        });
    },

    async findAllEvidence(): Promise<Evidence[]> {
        return fetchApi<Evidence[]>("/evidence", {
            method: "GET",
        });
    },

    async deleteEvidence(): Promise<void> {
        return fetchApi<void>("/evidence/{id}", {
            method: "DELETE",
        });
    },

    //Occurrence

    async createOccurrence(input: OccurrenceCreateInput): Promise<void> {
        return fetchApi<void>("/occurrence", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async findOccurrenceById(): Promise<Occurrence> {
        return fetchApi<Occurrence>("/occurrence/{occurrenceId}", {
            method: "GET",
        });
    },

    async findAllOccurrences(): Promise<Occurrence[]> {
        return fetchApi<Occurrence[]>("/occurrence", {
            method: "GET",
        });
    },

    async findOccurrencesByImportance(): Promise<Occurrence[]> {
        return fetchApi<Occurrence[]>("/occurrence/importance/{importance}", {
            method: "GET",
        });
    },

    async findOccurrencesByReporterId(): Promise<Occurrence[]> {
        return fetchApi<Occurrence[]>("/occurrence/reporter/{reporterId}", {
            method: "GET",
        });
    },

    async deleteOccurrenceById(): Promise<void> {
        return fetchApi<void>("/occurrence/{occurrenceId}", {
            method: "DELETE",
        });
    },

}