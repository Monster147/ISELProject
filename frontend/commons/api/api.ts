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
import {OccurrenceCreateInput} from "../models/occurrence/OccurrenceCreateInput";
import {Occurrence} from "../models/occurrence/Occurrence";
import {IntervenorIdInput} from "../models/intervenor/IntervenorIdInput";
import {StatusInput} from "../models/report/StatusInput";
import {EditorInput} from "../models/report/EditorInput";
import {Documents} from "../models/documents/Documents";
import {TypeCreateInput} from "../models/type/TypeCreateInput";
import {Type} from "../models/type/Type";
import {TypeUpdateInput} from "../models/type/TypeUpdateInput";
import {OverviewStats} from "../models/stats/OverviewStats";
import {StatsReportType} from "../models/stats/StatsReportType";
import {StatsReportStatus} from "../models/stats/StatsReportStatus";
import {StatsOccurrenceImportance} from "../models/stats/StatsOccurrenceImportance";
import {UploadFile} from "../models/utils/UploadFile";

type ApiAuthInfo = { token: string } | null;

type DocumentDownloadHandler = (apiBaseUrl: string, id: number) => Promise<void>;

type ApiRuntimeConfig = {
    getAuthInfo?: () => Promise<ApiAuthInfo>;
    getErrorDescription?: (errorType: string) => string;
    documentDownloadHandler?: DocumentDownloadHandler;
};

const defaultGetAuthInfo = async (): Promise<ApiAuthInfo> => null;
const defaultGetErrorDescription = (errorType: string): string => errorType;
const defaultDocumentDownloadHandler: DocumentDownloadHandler = async () => {
    throw new Error("Document download handler not configured");
};

let getAuthInfo = defaultGetAuthInfo;
let resolveErrorDescription = defaultGetErrorDescription;
let documentDownloadHandler = defaultDocumentDownloadHandler;
let API_BASE_URL = ""

export function configureApi(config: ApiRuntimeConfig, apiURL:string): void {
    API_BASE_URL= apiURL

    if (config.getAuthInfo) {
        getAuthInfo = config.getAuthInfo;
    }

    if (config.getErrorDescription) {
        resolveErrorDescription = config.getErrorDescription;
    }

    if (config.documentDownloadHandler) {
        documentDownloadHandler = config.documentDownloadHandler;
    }
}

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export async function getAuthHeaders(): Promise<HeadersInit> {
    const authInfo = await getAuthInfo();
    const token = authInfo?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const isFormData = options.body instanceof FormData;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ title: "Unknown error" }));
        const errorMessage = error.title
            ? resolveErrorDescription(error.title)
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
        console.log("Fetching user home with auth headers:", await getAuthHeaders());
        return fetchApi<UserHomeOutputModel>("/user/me", {
            headers: await getAuthHeaders(),
        });
    },

    async findUserById(userId:number): Promise<UserHomeOutputModel> {
        return fetchApi<UserHomeOutputModel>(`/user/${userId}`, {
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

    async findUsersByRole(roleId: number): Promise<UserHomeOutputModel[]>{
        return fetchApi<UserHomeOutputModel[]>(`/user/find/role/${roleId}`, {
            method: "GET",
        });
    },

    async getPercentages(userId:number): Promise<ReportTypePercentage[]>{
        return fetchApi<ReportTypePercentage[]>(`/user/percentages/${userId}`, {
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

    async deleteRole(roleName:string): Promise<void> {
        return fetchApi<void>(`/role/${roleName}`, {
            method: "DELETE",
        });
    },

    async findRoleByName(roleName:string): Promise<Role> {
        return fetchApi<Role>(`/role/byName/${roleName}`, {
            method: "GET",
        });
    },

    async findRoleById(id:number): Promise<Role> {
        return fetchApi<Role>(`/role/byId/${id}`, {
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

    async findReportById(id:number): Promise<Report> {
        return fetchApi<Report>(`/report/${id}`, {
            method: "GET",
        });
    },

    async findAllReports(): Promise<Report[]> {
        return fetchApi<Report[]>("/report", {
            method: "GET",
        });
    },

    async findByStatus(status:string): Promise<Report[]> {
        return fetchApi<Report[]>(`/report/byStatus/${status}`, {
            method: "GET",
        });
    },

    async findByCreator(creatorId:number): Promise<Report[]> {
        return fetchApi<Report[]>(`/report/byCreator/${creatorId}`, {
            method: "GET",
        });
    },

    async deleteReportById(id:number): Promise<void> {
        return fetchApi<void>(`/report/${id}`, {
            method: "DELETE",
        });
    },

    async updateReportStatus(input: StatusInput, id:number): Promise<Report> {
        return fetchApi<Report>(`/report/update-status/${id}`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async addEditor(input: EditorInput,id:number): Promise<Report> {
        return fetchApi<Report>(`/report/${id}/editors`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async removeEditor(input: number, id:number): Promise<Report> {
        return fetchApi<Report>(`/report/${id}/editors/`, {
            method: "DELETE",
            body: JSON.stringify(input),
        });
    },

    /*
    async addIntervenor(input: number, id:number): Promise<Report> {
        return fetchApi<Report>(`/report/${id}/intervenors`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async removeIntervenor(input: number, id:number): Promise<Report> {
        return fetchApi<Report>(`/report/${id}/intervenors`, {
            method: "DELETE",
            body: JSON.stringify(input),
        });
    },
    */

    // Intervenor

    async createIntervenor(input: IntervenorInput): Promise<void> {
        return fetchApi<void>("/intervenor", {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async findAllIntervenors(): Promise<Intervenor[]> {
        return fetchApi<Intervenor[]>("/intervenor", {
            method: "GET",
        });
    },

    async updateIntervenor(input: IntervenorUpdateInput, intervenorId:number): Promise<Intervenor> {
        return fetchApi<Intervenor>(`/intervenor/update/${intervenorId}`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async deleteIntervenorByIdNumber(idNumber:string): Promise<void> {
        return fetchApi<void>(`/intervenor/delete/byIdNumber/${idNumber}`, {
            method: "DELETE",
        });
    },

    async findIntervenorByIdNumber(idNumber:string): Promise<Intervenor> {
        return fetchApi<Intervenor>(`/intervenor/byIdNumber/${idNumber}`, {
            method: "GET",
        });
    },

    async findIntervenorByContactInfo(contactInfo:string): Promise<Intervenor> {
        return fetchApi<Intervenor>(`/intervenor/byContactInfo/${contactInfo}`, {
            method: "GET",
        });
    },

    async findIntervenorById(id:number): Promise<Intervenor> {
        return fetchApi<Intervenor>(`/intervenor/${id}`, {
            method: "GET",
        });
    },

    // Evidence

    async createEvidence(file: UploadFile, input: CreateEvidenceInput): Promise<Evidence> {
        const formData = new FormData();
        if (file.platform === "web") {
            formData.append(
                "file",
                file.file
            );
        } else {
            formData.append(
                "file",
                {
                    uri: file.uri!,
                    name: file.name,
                    type: file.type,
                } as any
            );
        }
        formData.append("data", JSON.stringify(input));
        console.log(formData);
        return fetchApi<Evidence>("/evidence", {
            method: "POST",
            body: formData
        });
    },

    async findEvidenceById(id:number): Promise<Evidence> {
        return fetchApi<Evidence>(`/evidence/${id}`, {
            method: "GET",
        });
    },

    async downloadEvidence(id:number): Promise<Blob>{
        const response = await fetch(`${API_BASE_URL}/evidence/${id}/download`, {
            headers: await getAuthHeaders(),
        });
        return await response.blob();
    },

    async findEvidenceByOccurrenceId(occurrenceId:number): Promise<Evidence> {
        return fetchApi<Evidence>(`/evidence/byOccurrence/${occurrenceId}`, {
            method: "GET",
        });
    },

    async findEvidenceByReporterId(reporterId:number): Promise<Evidence> {
        return fetchApi<Evidence>(`/evidence/byReporter/${reporterId}`, {
            method: "GET",
        });
    },

    async findEvidenceByType(input: Json): Promise<Evidence> {
        return fetchApi<Evidence>("/evidence/byType", {
            method: "GET",
            body: JSON.stringify(input),
        });
    },

    async findEvidenceByLocation(location:string): Promise<Evidence> {
        return fetchApi<Evidence>(`/evidence/byLocation/${location}`, {
            method: "GET",
        });
    },

    async findAllEvidence(): Promise<Evidence[]> {
        return fetchApi<Evidence[]>("/evidence", {
            method: "GET",
        });
    },

    async deleteEvidence(id:number): Promise<void> {
        return fetchApi<void>(`/evidence/${id}`, {
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

    async findOccurrenceById(occurrenceId:number): Promise<Occurrence> {
        return fetchApi<Occurrence>(`/occurrence/${occurrenceId}`, {
            method: "GET",
        });
    },

    async findAllOccurrences(): Promise<Occurrence[]> {
        return fetchApi<Occurrence[]>("/occurrence", {
            method: "GET",
        });
    },

    async findOccurrencesByImportance(importance:string): Promise<Occurrence[]> {
        return fetchApi<Occurrence[]>(`/occurrence/importance/${importance}`, {
            method: "GET",
        });
    },

    async findOccurrencesByReporterId(reporterId:number): Promise<Occurrence[]> {
        return fetchApi<Occurrence[]>(`/occurrence/reporter/${reporterId}`, {
            method: "GET",
        });
    },

    async deleteOccurrenceById(occurrenceId:number): Promise<void> {
        return fetchApi<void>(`/occurrence/${occurrenceId}`, {
            method: "DELETE",
        });
    },

    async addIntervenor(input: IntervenorIdInput, id:number): Promise<Occurrence> {
        return fetchApi<Occurrence>(`/occurrence/${id}/intervenors`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    },

    async removeIntervenor(input: IntervenorIdInput, id:number): Promise<Occurrence> {
        return fetchApi<Occurrence>(`/occurrence/${id}/intervenors`, {
            method: "DELETE",
            body: JSON.stringify(input),
        });
    },

    //Documents

    async getDocumentById(id: number): Promise<Documents> {
        return fetchApi<Documents>(`/documents/${id}`, {
            method: "GET"
        })
    },

    async getDocumentByName(name: string): Promise<Documents> {
        return fetchApi<Documents>(`/documents/name/${name}`, {
            method: "GET"
        })
    },

    async getDocumentByType(type: string): Promise<Documents> {
        return fetchApi<Documents>(`/documents/type/${type}`, {
            method: "GET"
        })
    },

    async getAllDocumentTypes(): Promise<string[]> {
        return fetchApi<string[]>(`/documents/types`, {
            method: "GET"
        })
    },

    async getAllDocument(): Promise<Documents[]> {
        return fetchApi<Documents[]>(`/documents`, {
            method: "GET"
        })
    },

    async DeleteDocumentById(id: number): Promise<Documents> {
        return fetchApi<Documents>(`/documents/${id}`, {
            method: "DELETE"
        })
    },

    async downloadDocument(id: number): Promise<void> {
        return documentDownloadHandler(API_BASE_URL, id);
    },

    //Types

    async createType(input:TypeCreateInput): Promise<Type>{
        return fetchApi<Type>(`/type`, {
            method: "POST",
            body: JSON.stringify(input)
        })
    },

    async findTypeById(id:number): Promise<Type>{
        return fetchApi<Type>(`/type/${id}`, {
            method: "GET"
        })
    },

    async findTypeByName(name:string): Promise<Type>{
        return fetchApi<Type>(`/type/name/${name}`, {
            method: "GET"
        })
    },

    async findAllTypes():Promise<Type[]>{
        return fetchApi<Type[]>(`/type`, {
            method: "GET"
        })
    },

    async updateType(id:number, input:TypeUpdateInput):Promise<Type>{
        return fetchApi<Type>(`/type/${id}`, {
            method: "POST",
            body: JSON.stringify(input)
        })
    },

    async deleteTypeById(id:number):Promise<void>{
        return fetchApi<void>(`/type/${id}`, {
            method: "DELETE"
        })
    },

    // Stats

    async getOverviewStats():Promise<OverviewStats>{
        return fetchApi<OverviewStats>(`/stats`, {
            method: "GET"
        })
    },

    async getStatsReportByType():Promise<StatsReportType[]>{
        return fetchApi<StatsReportType[]>(`/stats/report/type`, {
            method: "GET"
        })
    },

    async getStatsReportByStatus():Promise<StatsReportStatus[]>{
        return fetchApi<StatsReportStatus[]>(`/stats/report/status`, {
            method: "GET"
        })
    },

    async getStatsOccurrenceByImportance():Promise<StatsOccurrenceImportance[]>{
        return fetchApi<StatsOccurrenceImportance[]>(`/stats/occurrence/importance`, {
            method: "GET"
        })
    },

    async getStatsReportByTypeThisMonth():Promise<StatsReportType[]>{
        return fetchApi<StatsReportType[]>(`/stats/report/type/month`, {
            method: "GET"
        })
    },

    async getStatsReportByStatusThisMonth():Promise<StatsReportStatus[]>{
        return fetchApi<StatsReportStatus[]>(`/stats/report/status/month`, {
            method: "GET"
        })
    },

    async getStatsOccurrenceByImportanceThisMonth():Promise<StatsOccurrenceImportance[]>{
        return fetchApi<StatsOccurrenceImportance[]>(`/stats/occurrence/importance/month`, {
            method: "GET"
        })
    }

}