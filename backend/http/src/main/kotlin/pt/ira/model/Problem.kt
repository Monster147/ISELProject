package pt.ira.model

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import java.net.URI

private const val MEDIA_TYPE = "application/problem+json"
private const val PROBLEM_URI_PATH =
    "https://github.com/Monster147/ISELProject/tree/main/backend/docs/problems"

/**
 * Hierarquia de problemas HTTP padronizados para respostas de erro.
 *
 * Implementa o padrão RFC 7807 (Problem Details for HTTP APIs), fornecendo uma representação
 * estruturada e consistente de erros que ocorrem no sistema. Cada variante da hierarquia
 * representa um cenário de erro específico, mapeado para uma URI descritiva e um código HTTP apropriado.
 *
 * A classe encapsula a lógica de construção de respostas HTTP com tipo de conteúdo padronizado
 * (`application/problem+json`), facilitando a interpretação de erros pelos clientes.
 *
 * Responsabilidades principais:
 * - Encapsulamento de erros específicos do domínio com URIs descritivas;
 * - Construção de respostas HTTP estruturadas com status apropriado;
 * - Fornecimento de títulos e tipos de erro consistentes;
 * - Conformidade com o padrão RFC 7807 para representação de problemas em APIs REST.
 *
 * @param typeUri URI que identifica o tipo de problema, tipicamente apontando para a documentação do erro.
 *
 * @property type String representando a URI do tipo de problema.
 * @property title Título descritivo extraído do último segmento da URI (automaticamente gerado).
 *
 * @see ResponseEntity
 * @see HttpStatus
 */
sealed class Problem(
    typeUri: URI,
) {
    val type = typeUri.toString()
    val title = typeUri.toString().split("/").last()

    /**
     * Constrói uma resposta HTTP com o status e conteúdo apropriados para este problema.
     *
     * Define o header `Content-Type` como `application/problem+json` conforme o padrão RFC 7807,
     * e serializa a instância do problema no corpo da resposta.
     *
     * @param status Status HTTP a ser retornado na resposta.
     * @return [ResponseEntity] configurada com o status, header e corpo apropriados.
     */
    fun response(status: HttpStatus): ResponseEntity<Any> =
        ResponseEntity
            .status(status)
            .header("Content-Type", MEDIA_TYPE)
            .body(this)

    // server
    data object InternalError : Problem(URI("${PROBLEM_URI_PATH}/internal-error"))

    // user
    data object EmailAlreadyInUse : Problem(URI("${PROBLEM_URI_PATH}/email-already-in-use"))

    data object InsecurePassword : Problem(URI("${PROBLEM_URI_PATH}/insecure-password"))

    data object UserOrPasswordAreInvalid : Problem(URI("${PROBLEM_URI_PATH}/user-or-password-are-invalid"))

    data object UserNotFound : Problem(URI("${PROBLEM_URI_PATH}/user-not-found"))

    data object UserNotAdmin : Problem(URI("${PROBLEM_URI_PATH}/user-not-admin"))

    // role
    data object RoleNotFound : Problem(URI("${PROBLEM_URI_PATH}/role-not-found"))

    data object RoleAlreadyExists : Problem(URI("${PROBLEM_URI_PATH}/role-already-exists"))

    // intervenor
    data object IntervenorAlreadyExists : Problem(URI("${PROBLEM_URI_PATH}/intervenor-already-exists"))

    data object IntervenorNotFound : Problem(URI("${PROBLEM_URI_PATH}/intervenor-not-found"))

    // report
    data object ReportNotFound : Problem(URI("${PROBLEM_URI_PATH}/report-not-found"))

    // evidence
    data object ReporterNotFound : Problem(URI("${PROBLEM_URI_PATH}/reporter-not-found"))

    data object EvidenceNotFound : Problem(URI("${PROBLEM_URI_PATH}/evidence-not-found"))

    data object InvalidFile : Problem(URI("${PROBLEM_URI_PATH}/invalid-file"))

    data object FileNotFound : Problem(URI("${PROBLEM_URI_PATH}/file-not-found"))

    // occurrence
    data object OccurrenceNotFound : Problem(URI("${PROBLEM_URI_PATH}/occurrence-not-found"))

    data object OccurrenceNotAssignedToUser : Problem(URI("${PROBLEM_URI_PATH}/occurrence-not-assigned-to-user"))

    data object EndDateNotValid : Problem(URI("${PROBLEM_URI_PATH}/end-date-not-valid"))

    data object DuplicateUsersIds : Problem(URI("${PROBLEM_URI_PATH}/duplicate-users-ids"))

    data object IntervenorNotInOccurrence : Problem(URI("${PROBLEM_URI_PATH}/intervenor-not-in-occurrence"))

    data object IntervenorAlreadyInOccurrence : Problem(URI("${PROBLEM_URI_PATH}/intervenor-already-in-occurrence"))

    // documents
    data object FileAlreadyExists : Problem(URI("${PROBLEM_URI_PATH}/file-already-exists"))

    // type
    data object TypeNotFound : Problem(URI("${PROBLEM_URI_PATH}/type-not-found"))

    data object TypeAlreadyExists : Problem(URI("${PROBLEM_URI_PATH}/type-already-exists"))

    data object InvalidName : Problem(URI("${PROBLEM_URI_PATH}/invalid-name"))
}
