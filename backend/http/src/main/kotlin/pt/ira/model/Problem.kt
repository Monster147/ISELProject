package pt.ira.model

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import java.net.URI

private const val MEDIA_TYPE = "application/problem+json"
private const val PROBLEM_URI_PATH =
    "https://github.com/Monster147/ISELProject/tree/main/backend/docs/problems"

sealed class Problem(
    typeUri: URI,
) {
    val type = typeUri.toString()
    val title = typeUri.toString().split("/").last()

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

    // role
    data object RoleNotFound : Problem(URI("${PROBLEM_URI_PATH}/role-not-found"))

    data object RoleAlreadyExists : Problem(URI("${PROBLEM_URI_PATH}/role-already-exists"))

    // intervenor
    data object IntervenorAlreadyExists : Problem(URI("${PROBLEM_URI_PATH}/intervenor-already-exists"))

    data object IntervenorNotFound : Problem(URI("${PROBLEM_URI_PATH}/intervenor-not-found"))

    // report
    data object ReportNotFound : Problem(URI("${PROBLEM_URI_PATH}/report-not-found"))

    // evidence
    data object ReporterNotFound : Problem(URI("${PROBLEM_URI_PATH}/report-not-found"))

    data object EvidenceNotFound : Problem(URI("${PROBLEM_URI_PATH}/evidence-not-found"))
}
