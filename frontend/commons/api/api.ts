import { UserInput } from "../models/user/UserInput";
import { UserCreateTokenOutputModel } from "../models/user/UserCreateTokenOutputModel";
import { UserCreateTokenInputModel } from "../models/user/UserCreateTokenInputModel";
import { UserHomeOutputModel } from "../models/user/UserHomeOutputModel";
import { RoleInput } from "../models/role/RoleInput";
import { RolesInput } from "../models/role/RolesInput";
import { ReportTypePercentage } from "../models/report/ReportTypePercentage";
import { Role } from "../models/role/Role";
import { CreateReportInput } from "../models/report/CreateReportInput";
import { IntervenorInput } from "../models/intervenor/IntervenorInput";
import { Intervenor } from "../models/intervenor/Intervenor";
import { IntervenorUpdateInput } from "../models/intervenor/IntervenorUpdateInput";
import { CreateEvidenceInput } from "../models/evidence/CreateEvidenceInput";
import { Evidence } from "../models/evidence/Evidence";
import { Json } from "../models/utils/Json";
import { Report } from "../models/report/Report";
import { OccurrenceCreateInput } from "../models/occurrence/OccurrenceCreateInput";
import { Occurrence } from "../models/occurrence/Occurrence";
import { IntervenorIdInput } from "../models/intervenor/IntervenorIdInput";
import { StatusInput } from "../models/report/StatusInput";
import { EditorInput } from "../models/report/EditorInput";
import { Documents } from "../models/documents/Documents";
import { TypeCreateInput } from "../models/type/TypeCreateInput";
import { Type } from "../models/type/Type";
import { TypeUpdateInput } from "../models/type/TypeUpdateInput";
import { OverviewStats } from "../models/stats/OverviewStats";
import { StatsReportType } from "../models/stats/StatsReportType";
import { StatsReportStatus } from "../models/stats/StatsReportStatus";
import { StatsOccurrenceImportance } from "../models/stats/StatsOccurrenceImportance";
import { UploadFile } from "../models/utils/UploadFile";
import { getErrorDescription } from "../errors/ErrorDescriptions";

/** Informação de autenticação do utilizador — token Bearer ou null quando não autenticado. */
type ApiAuthInfo = { token: string } | null;

/**
 * Handler responsável por fazer download de um documento.
 * @param apiBaseUrl URL base da API.
 * @param id Identificador do documento a realizar download.
 */
type DocumentDownloadHandler = (
  apiBaseUrl: string,
  id: number,
  authHeaders: HeadersInit,
) => Promise<void>;

/**
 * Handler responsável fazer download de uma evidência.
 * @param apiBaseUrl URL base da API.
 * @param evidenceId Identificador da evidência a realizar download.
 * @param authHeaders Cabeçalhos de autenticação a incluir no pedido.
 * @param keep Se true, guarda o ficheiro permanentemente; caso contrário, retorna apenas o blob temporário.
 */
type EvidenceDownloadHandler = (
  apiBaseUrl: string,
  evidenceId: number,
  authHeaders: HeadersInit,
  keep: boolean,
) => Promise<any>;

/**
 * Configuração injetável em runtime para adaptar o comportamento da API
 * consoante a plataforma (desktop ou móvel).
 */
type ApiRuntimeConfig = {
  /** Função que retorna as informações de autenticação atuais. */
  getAuthInfo?: () => Promise<ApiAuthInfo>;
  /** Handler de download de documentos. */
  documentDownloadHandler?: DocumentDownloadHandler;
  /** Handler de download de evidências. */
  evidenceDownloadHandler?: EvidenceDownloadHandler;
};

const defaultGetAuthInfo = async (): Promise<ApiAuthInfo> => null;
const defaultDocumentDownloadHandler: DocumentDownloadHandler = async () => {
  throw new Error("Document download handler not configured");
};

const defaultEvidenceDownloadHandler: EvidenceDownloadHandler = async () => {
  throw new Error("Evidence download handler not configured");
};

let getAuthInfo = defaultGetAuthInfo;
let documentDownloadHandler = defaultDocumentDownloadHandler;
let evidenceDownloadHandler = defaultEvidenceDownloadHandler;
let API_BASE_URL = "";

/**
 * Configura o módulo de API com as dependências de plataforma e o URL base.
 * Deve ser chamado uma única vez no arranque da aplicação (desktop ou móvel)
 * antes de qualquer chamada à API.
 *
 * @param config Configuração com os handlers e o getter de autenticação.
 * @param apiURL URL base da API (ex: "/api" ou "https://example.com/api").
 */
export function configureApi(config: ApiRuntimeConfig, apiURL: string): void {
  API_BASE_URL = apiURL;

  if (config.getAuthInfo) {
    getAuthInfo = config.getAuthInfo;
  }

  if (config.documentDownloadHandler) {
    documentDownloadHandler = config.documentDownloadHandler;
  }

  if (config.evidenceDownloadHandler) {
    evidenceDownloadHandler = config.evidenceDownloadHandler;
  }
}

/**
 * Erro lançado quando a API retorna uma resposta com status HTTP-2xx.
 */
export class ApiError extends Error {
  /**
   * @param status Código de status HTTP da resposta.
   * @param message Mensagem de erro localizada.
   */
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Constrói os cabeçalhos de autenticação Bearer a partir das credenciais atuais.
 * Retorna um objeto vazio se o utilizador não estiver autenticado.
 *
 * @returns Cabeçalhos HTTP com o token de autorização, ou objeto vazio.
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const authInfo = await getAuthInfo();
  const token = authInfo?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Função genérica de fetch para a API.
 * Adiciona automaticamente o cabeçalho `Content-Type: application/json`
 * (exceto para FormData), trata respostas de erro e deserializa o JSON.
 *
 * @template T Tipo esperado da resposta.
 * @param endpoint Caminho do endpoint relativo ao URL base (ex: "/user").
 * @param options Opções adicionais do fetch (method, headers, body, etc.).
 * @returns Promise com a resposta deserializada do tipo T.
 * @throws {ApiError} Se a resposta HTTP não for bem-sucedida (status não-2xx).
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      "ngrok-skip-browser-warning": "true",
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

  if (
    response.status === 204 ||
    response.headers.get("Content-Length") === "0"
  ) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Objeto central de acesso à API REST do backend.
 * Agrupa todos os endpoints organizados por domínio:
 * utilizadores, cargos, relatórios, intervenientes,
 * evidências, ocorrências, documentos, tipos e estatísticas.
 */
export const api = {
  // Users

  /**
   * Regista um novo utilizador no sistema.
   * @param input Dados do utilizador a criar (nome, email, password).
   */
  async createUser(input: UserInput): Promise<void> {
    return fetchApi<void>("/user", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  /**
   * Cria um token de autenticação (login).
   * @param input Credenciais do utilizador (email e password).
   * @returns Modelo com o token de acesso gerado.
   */
  async createToken(
    input: UserCreateTokenInputModel,
  ): Promise<UserCreateTokenOutputModel> {
    return fetchApi<UserCreateTokenOutputModel>("/user/token", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  /**
   * Invalida o token de autenticação atual (logout).
   */
  async logout(): Promise<void> {
    return fetchApi<void>("/user/logout", {
      method: "POST",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém os dados do utilizador autenticado.
   * @returns Modelo com a informação do utilizador atual.
   */
  async userHome(): Promise<UserHomeOutputModel> {
    return fetchApi<UserHomeOutputModel>("/user/me", {
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém os dados de um utilizador pelo seu identificador.
   * @param userId Identificador do utilizador.
   * @returns Modelo com a informação do utilizador.
   */
  async findUserById(userId: number): Promise<UserHomeOutputModel> {
    return fetchApi<UserHomeOutputModel>(`/user/${userId}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Adiciona um cargo a um utilizador.
   * @param input Identificadores do utilizador e do cargo a adicionar.
   */
  async addRole(input: RoleInput): Promise<void> {
    return fetchApi<void>("/user/roles/add", {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Remove um cargo de um utilizador.
   * @param input Identificadores do utilizador e do cargo a remover.
   */
  async removeRole(input: RoleInput): Promise<void> {
    return fetchApi<void>("/user/roles/remove", {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Define o conjunto de cargos de um utilizador, substituindo os existentes.
   * @param input Identificador do utilizador e lista de identificadores de cargos.
   */
  async setRoles(input: RolesInput): Promise<void> {
    return fetchApi<void>("/user/roles/set", {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista todos os utilizadores que possuem um determinado cargo.
   * @param roleId Identificador do cargo.
   * @returns Lista de utilizadores com esse cargo.
   */
  async findUsersByRole(roleId: number): Promise<UserHomeOutputModel[]> {
    return fetchApi<UserHomeOutputModel[]>(`/user/find/role/${roleId}`, {
      method: "GET",
    });
  },

  /**
   * Obtém as percentagens de tipos de relatório associados a um utilizador.
   * @param userId Identificador do utilizador.
   * @returns Lista com as percentagens por tipo de relatório.
   */
  async getPercentages(userId: number): Promise<ReportTypePercentage[]> {
    return fetchApi<ReportTypePercentage[]>(`/user/percentages/${userId}`, {
      method: "GET",
    });
  },

  // Roles

  /**
   * Cria um novo cargo no sistema.
   * @param input Nome do cargo a criar.
   */
  async createRole(input: string): Promise<void> {
    return fetchApi<void>("/role", {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Elimina um cargo pelo seu nome.
   * @param roleName Nome do cargo a eliminar.
   */
  async deleteRole(roleName: string): Promise<void> {
    return fetchApi<void>(`/role/${roleName}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém um cargo pelo seu nome.
   * @param roleName Nome do cargo.
   * @returns Dados do cargo encontrado.
   */
  async findRoleByName(roleName: string): Promise<Role> {
    return fetchApi<Role>(`/role/byName/${roleName}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém um cargo pelo seu identificador.
   * @param id Identificador do cargo.
   * @returns Dados do cargo encontrado.
   */
  async findRoleById(id: number): Promise<Role> {
    return fetchApi<Role>(`/role/byId/${id}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista todos os cargos existentes no sistema.
   * @returns Lista de todos os cargos.
   */
  async findAllRole(): Promise<Role[]> {
    return fetchApi<Role[]>("/role", {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  // Report

  /**
   * Cria um novo relatório associado a uma ocorrência.
   * @param input Dados necessários para criar o relatório.
   */
  async createReport(input: CreateReportInput): Promise<void> {
    return fetchApi<void>("/report", {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém um relatório pelo seu identificador.
   * @param id Identificador do relatório.
   * @returns Dados do relatório encontrado.
   */
  async findReportById(id: number): Promise<Report> {
    return fetchApi<Report>(`/report/${id}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém o relatório associado a uma ocorrência.
   * @param occurrenceId Identificador da ocorrência.
   * @returns Relatório associado à ocorrência.
   */
  async findReportByOccurrenceId(occurrenceId: number): Promise<Report> {
    return fetchApi<Report>(`/report/byOccurrence/${occurrenceId}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Submete um relatório para aprovação.
   * @param id Identificador do relatório a submeter.
   * @returns True se a submissão foi bem-sucedida.
   */
  async submitReport(id: number): Promise<Boolean> {
    return fetchApi<Boolean>(`/report/submit/${id}`, {
      method: "POST",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista todos os relatórios existentes no sistema.
   * @returns Lista de todos os relatórios.
   */
  async findAllReports(): Promise<Report[]> {
    return fetchApi<Report[]>("/report", {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista relatórios filtrados pelo seu estado.
   * @param status Estado do relatório (ex: "SUBMITTED", "APPROVED").
   * @returns Lista de relatórios com esse estado.
   */
  async findByStatus(status: string): Promise<Report[]> {
    return fetchApi<Report[]>(`/report/byStatus/${status}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista relatórios criados por um determinado utilizador.
   * @param creatorId Identificador do utilizador criador.
   * @returns Lista de relatórios criados pelo utilizador.
   */
  async findByCreator(creatorId: number): Promise<Report[]> {
    return fetchApi<Report[]>(`/report/byCreator/${creatorId}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Elimina um relatório pelo seu identificador.
   * @param id Identificador do relatório a eliminar.
   */
  async deleteReportById(id: number): Promise<void> {
    return fetchApi<void>(`/report/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Atualiza o estado de um relatório.
   * @param input Novo estado a aplicar.
   * @param id Identificador do relatório a atualizar.
   * @returns Relatório com o estado atualizado.
   */
  async updateReportStatus(input: StatusInput, id: number): Promise<Report> {
    return fetchApi<Report>(`/report/update-status/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Adiciona um editor a um relatório.
   * @param input Identificador do editor a adicionar.
   * @param id Identificador do relatório.
   * @returns Relatório atualizado com o novo editor.
   */
  async addEditor(input: EditorInput, id: number): Promise<Report> {
    return fetchApi<Report>(`/report/${id}/editors`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Remove um editor de um relatório.
   * @param input Identificador do editor a remover.
   * @param id Identificador do relatório.
   * @returns Relatório atualizado sem o editor.
   */
  async removeEditor(input: number, id: number): Promise<Report> {
    return fetchApi<Report>(`/report/${id}/editors/`, {
      method: "DELETE",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Atualiza o PDF de um relatório já existente.
   * @param id Identificador do relatório a atualizar.
   * @returns Relatório atualizado com o novo ficheiro PDF.
   */
  async updateReport(id: number): Promise<Report> {
    return fetchApi<Report>(`/report/update/${id}`, {
      method: "PUT",
      headers: await getAuthHeaders(),
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

  /**
   * Cria um novo interveniente no sistema.
   * @param input Dados do interveniente a criar.
   */
  async createIntervenor(input: IntervenorInput): Promise<void> {
    return fetchApi<void>("/intervenor", {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista todos os intervenientes existentes no sistema.
   * @returns Lista de todos os intervenientes.
   */
  async findAllIntervenors(): Promise<Intervenor[]> {
    return fetchApi<Intervenor[]>("/intervenor", {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Atualiza os dados de um interveniente.
   * @param input Campos a atualizar (campos nulos mantêm o valor atual).
   * @param intervenorId Identificador do interveniente a atualizar.
   * @returns Interveniente com os dados atualizados.
   */
  async updateIntervenor(
    input: IntervenorUpdateInput,
    intervenorId: number,
  ): Promise<Intervenor> {
    return fetchApi<Intervenor>(`/intervenor/update/${intervenorId}`, {
      method: "PUT",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Elimina um interveniente pelo seu número de identificação.
   * @param idNumber Número de identificação do interveniente a eliminar.
   */
  async deleteIntervenorByIdNumber(idNumber: string): Promise<void> {
    return fetchApi<void>(`/intervenor/delete/byIdNumber/${idNumber}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém um interveniente pelo seu número de identificação.
   * @param idNumber Número de identificação do interveniente.
   * @returns Dados do interveniente encontrado.
   */
  async findIntervenorByIdNumber(idNumber: string): Promise<Intervenor> {
    return fetchApi<Intervenor>(`/intervenor/byIdNumber/${idNumber}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém um interveniente pelos seus dados de contacto.
   * @param contactInfo Informação de contacto do interveniente.
   * @returns Dados do interveniente encontrado.
   */
  async findIntervenorByContactInfo(contactInfo: string): Promise<Intervenor> {
    return fetchApi<Intervenor>(`/intervenor/byContactInfo/${contactInfo}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém um interveniente pelo seu identificador.
   * @param id Identificador do interveniente.
   * @returns Dados do interveniente encontrado.
   */
  async findIntervenorById(id: number): Promise<Intervenor> {
    return fetchApi<Intervenor>(`/intervenor/${id}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  // Evidence

  /**
   * Cria uma nova evidência associada a uma ocorrência, enviando o ficheiro via multipart.
   * O campo file é serializado de forma diferente consoante a plataforma (desktop ou móvel).
   * @param file Ficheiro a enviar (objeto com variante de plataforma).
   * @param input Metadados da evidência (tipo, localização, descrição, etc.).
   * @returns Evidência criada com os dados persistidos.
   */
  async createEvidence(
    file: UploadFile,
    input: CreateEvidenceInput,
  ): Promise<Evidence> {
    const formData = new FormData();
    if (file.platform === "web") {
      formData.append("file", file.file);
    } else {
      formData.append("file", {
        uri: file.uri!,
        name: file.name,
        type: file.type,
      } as any);
    }
    formData.append("data", JSON.stringify(input));
    return fetchApi<Evidence>("/evidence", {
      method: "POST",
      body: formData,
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém uma evidência pelo seu identificador.
   * @param id Identificador da evidência.
   * @returns Dados da evidência encontrada.
   */
  async findEvidenceById(id: number): Promise<Evidence> {
    return fetchApi<Evidence>(`/evidence/${id}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Realiza download do ficheiro de uma evidência usando o handler configurado para a plataforma.
   * @param id Identificador da evidência.
   * @param keep Se true, guarda o ficheiro permanentemente; caso contrário, retorna apenas o blob temporário.
   * @returns Resultado do handler de download (varia por plataforma).
   */
  async downloadEvidence(id: number, keep: boolean): Promise<any> {
    const authHeaders = await getAuthHeaders();
    return evidenceDownloadHandler(API_BASE_URL, id, authHeaders, keep);
  },

  /**
   * Lista todas as evidências associadas a uma ocorrência.
   * @param occurrenceId Identificador da ocorrência.
   * @returns Lista de evidências da ocorrência.
   */
  async findEvidenceByOccurrenceId(occurrenceId: number): Promise<Evidence[]> {
    return fetchApi<Evidence[]>(`/evidence/byOccurrence/${occurrenceId}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista todas as evidências registadas por um utilizador.
   * @param reporterId Identificador do utilizador que registou as evidências.
   * @returns Lista de evidências do utilizador.
   */
  async findEvidenceByReporterId(reporterId: number): Promise<Evidence[]> {
    return fetchApi<Evidence[]>(`/evidence/byReporter/${reporterId}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém uma evidência pelo seu tipo.
   * @param input Tipo de evidência em formato JSON.
   * @returns Evidência correspondente ao tipo.
   */
  async findEvidenceByType(input: Json): Promise<Evidence> {
    return fetchApi<Evidence>("/evidence/byType", {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém uma evidência pela sua localização.
   * @param location Localização associada à evidência.
   * @returns Evidência encontrada.
   */
  async findEvidenceByLocation(location: string): Promise<Evidence> {
    return fetchApi<Evidence>(`/evidence/byLocation/${location}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista todas as evidências existentes no sistema.
   * @returns Lista de todas as evidências.
   */
  async findAllEvidence(): Promise<Evidence[]> {
    return fetchApi<Evidence[]>("/evidence", {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Elimina uma evidência pelo seu identificador.
   * @param id Identificador da evidência a eliminar.
   */
  async deleteEvidence(id: number): Promise<void> {
    return fetchApi<void>(`/evidence/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Atualiza o ficheiro de uma evidência existente via multipart.
   * @param file Novo ficheiro a associar à evidência.
   * @param id Identificador da evidência a atualizar.
   * @returns Evidência com o ficheiro atualizado.
   */
  async updateEvidence(file: UploadFile, id: number): Promise<Evidence> {
    const formData = new FormData();
    if (file.platform === "web") {
      formData.append("file", file.file);
    } else {
      formData.append("file", {
        uri: file.uri!,
        name: file.name,
        type: file.type,
      } as any);
    }

    return fetchApi<Evidence>(`/evidence/update/${id}`, {
      method: "PUT",
      body: formData,
      headers: await getAuthHeaders(),
    });
  },

  //Occurrence

  /**
   * Cria uma nova ocorrência no sistema.
   * @param input Dados da ocorrência a criar.
   */
  async createOccurrence(input: OccurrenceCreateInput): Promise<void> {
    return fetchApi<void>("/occurrence", {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém uma ocorrência pelo seu identificador.
   * @param occurrenceId Identificador da ocorrência.
   * @returns Dados da ocorrência encontrada.
   */
  async findOccurrenceById(occurrenceId: number): Promise<Occurrence> {
    return fetchApi<Occurrence>(`/occurrence/${occurrenceId}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista todas as ocorrências existentes no sistema.
   * @returns Lista de todas as ocorrências.
   */
  async findAllOccurrences(): Promise<Occurrence[]> {
    return fetchApi<Occurrence[]>("/occurrence", {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista ocorrências filtradas pelo seu nível de importância.
   * @param importance Nível de importância (ex: "NORMAL", "URGENT", "CRITICAL").
   * @returns Lista de ocorrências com esse nível de importância.
   */
  async findOccurrencesByImportance(importance: string): Promise<Occurrence[]> {
    return fetchApi<Occurrence[]>(`/occurrence/importance/${importance}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista ocorrências registadas por um determinado utilizador.
   * @param reporterId Identificador do utilizador que registou as ocorrências.
   * @returns Lista de ocorrências do utilizador.
   */
  async findOccurrencesByReporterId(reporterId: number): Promise<Occurrence[]> {
    return fetchApi<Occurrence[]>(`/occurrence/reporter/${reporterId}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Elimina uma ocorrência pelo seu identificador.
   * @param occurrenceId Identificador da ocorrência a eliminar.
   */
  async deleteOccurrenceById(occurrenceId: number): Promise<void> {
    return fetchApi<void>(`/occurrence/${occurrenceId}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Adiciona um interveniente a uma ocorrência.
   * @param input Identificador do interveniente a adicionar.
   * @param id Identificador da ocorrência.
   * @returns Ocorrência atualizada com o novo interveniente.
   */
  async addIntervenor(
    input: IntervenorIdInput,
    id: number,
  ): Promise<Occurrence> {
    return fetchApi<Occurrence>(`/occurrence/${id}/intervenors`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Remove um interveniente de uma ocorrência.
   * @param input Identificador do interveniente a remover.
   * @param id Identificador da ocorrência.
   * @returns Ocorrência atualizada sem o interveniente.
   */
  async removeIntervenor(
    input: IntervenorIdInput,
    id: number,
  ): Promise<Occurrence> {
    return fetchApi<Occurrence>(`/occurrence/${id}/intervenors`, {
      method: "DELETE",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  //Documents

  /**
   * Obtém um documento pelo seu identificador.
   * @param id Identificador do documento.
   * @returns Dados do documento encontrado.
   */
  async getDocumentById(id: number): Promise<Documents> {
    return fetchApi<Documents>(`/documents/${id}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém um documento pelo seu nome.
   * @param name Nome do documento.
   * @returns Dados do documento encontrado.
   */
  async getDocumentByName(name: string): Promise<Documents> {
    return fetchApi<Documents>(`/documents/name/${name}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém um documento pelo seu tipo.
   * @param type Tipo do documento.
   * @returns Dados do documento encontrado.
   */
  async getDocumentByType(type: string): Promise<Documents> {
    return fetchApi<Documents>(`/documents/type/${type}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista todos os tipos de documentos disponíveis no sistema.
   * @returns Lista de strings com os tipos de documentos.
   */
  async getAllDocumentTypes(): Promise<string[]> {
    return fetchApi<string[]>(`/documents/types`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista todos os documentos existentes no sistema.
   * @returns Lista de todos os documentos.
   */
  async getAllDocument(): Promise<Documents[]> {
    return fetchApi<Documents[]>(`/documents`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Elimina um documento pelo seu identificador.
   * @param id Identificador do documento a eliminar.
   * @returns Dados do documento eliminado.
   */
  async DeleteDocumentById(id: number): Promise<Documents> {
    return fetchApi<Documents>(`/documents/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Faz download um documento usando o handler configurado para a plataforma.
   * @param id Identificador do documento a realizar download.
   */
  async downloadDocument(id: number): Promise<void> {
    const authHeaders = await getAuthHeaders();
    return documentDownloadHandler(API_BASE_URL, id, authHeaders);
  },

  //Types

  /**
   * Cria um novo tipo de ocorrência no sistema.
   * @param input Dados do tipo a criar (nome e formulário dinâmico).
   * @returns Tipo de ocorrência criado.
   */
  async createType(input: TypeCreateInput): Promise<Type> {
    return fetchApi<Type>(`/type`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém um tipo de ocorrência pelo seu identificador.
   * @param id Identificador do tipo.
   * @returns Dados do tipo encontrado.
   */
  async findTypeById(id: number): Promise<Type> {
    return fetchApi<Type>(`/type/${id}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém um tipo de ocorrência pelo seu nome.
   * @param name Nome do tipo.
   * @returns Dados do tipo encontrado.
   */
  async findTypeByName(name: string): Promise<Type> {
    return fetchApi<Type>(`/type/name/${name}`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Lista todos os tipos de ocorrência existentes no sistema.
   * @returns Lista de todos os tipos.
   */
  async findAllTypes(): Promise<Type[]> {
    return fetchApi<Type[]>(`/type`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Atualiza os dados de um tipo de ocorrência.
   * @param id Identificador do tipo a atualizar.
   * @param input Campos a atualizar (campos nulos mantêm o valor atual).
   * @returns Tipo com os dados atualizados.
   */
  async updateType(id: number, input: TypeUpdateInput): Promise<Type> {
    return fetchApi<Type>(`/type/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Elimina um tipo de ocorrência pelo seu identificador.
   * @param id Identificador do tipo a eliminar.
   */
  async deleteTypeById(id: number): Promise<void> {
    return fetchApi<void>(`/type/${id}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });
  },

  // Stats

  /**
   * Obtém as estatísticas gerais do sistema (totais de utilizadores, ocorrências, relatórios e evidências).
   * @returns Modelo com as estatísticas de visão geral.
   */
  async getOverviewStats(): Promise<OverviewStats> {
    return fetchApi<OverviewStats>(`/stats`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém a distribuição de relatórios por tipo (histórico total).
   * @returns Lista com a contagem e percentagem de relatórios por tipo.
   */
  async getStatsReportByType(): Promise<StatsReportType[]> {
    return fetchApi<StatsReportType[]>(`/stats/report/type`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém a distribuição de relatórios por estado (histórico total).
   * @returns Lista com a contagem e percentagem de relatórios por estado.
   */
  async getStatsReportByStatus(): Promise<StatsReportStatus[]> {
    return fetchApi<StatsReportStatus[]>(`/stats/report/status`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém a distribuição de ocorrências por nível de importância (histórico total).
   * @returns Lista com a contagem e percentagem de ocorrências por importância.
   */
  async getStatsOccurrenceByImportance(): Promise<StatsOccurrenceImportance[]> {
    return fetchApi<StatsOccurrenceImportance[]>(
      `/stats/occurrence/importance`,
      {
        method: "GET",
        headers: await getAuthHeaders(),
      },
    );
  },

  /**
   * Obtém a distribuição de relatórios por tipo no mês atual.
   * @returns Lista com a contagem e percentagem de relatórios por tipo este mês.
   */
  async getStatsReportByTypeThisMonth(): Promise<StatsReportType[]> {
    return fetchApi<StatsReportType[]>(`/stats/report/type/month`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém a distribuição de relatórios por estado no mês atual.
   * @returns Lista com a contagem e percentagem de relatórios por estado este mês.
   */
  async getStatsReportByStatusThisMonth(): Promise<StatsReportStatus[]> {
    return fetchApi<StatsReportStatus[]>(`/stats/report/status/month`, {
      method: "GET",
      headers: await getAuthHeaders(),
    });
  },

  /**
   * Obtém a distribuição de ocorrências por nível de importância no mês atual.
   * @returns Lista com a contagem e percentagem de ocorrências por importância este mês.
   */
  async getStatsOccurrenceByImportanceThisMonth(): Promise<
    StatsOccurrenceImportance[]
  > {
    return fetchApi<StatsOccurrenceImportance[]>(
      `/stats/occurrence/importance/month`,
      {
        method: "GET",
        headers: await getAuthHeaders(),
      },
    );
  },
};
