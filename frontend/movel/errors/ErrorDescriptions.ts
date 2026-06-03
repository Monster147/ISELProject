import i18n from "i18next";

export const errorDescriptions: Record<string, string> = {
    "duplicate-users-ids": "errorResponse.duplicateUsersIds",
    "email-already-in-use": "errorResponse.emailAlreadyInUse",
    "end-date-not-valid": "errorResponse.endDateNotValid",
    "evidence-not-found": "errorResponse.evidenceNotFound",
    "file-already-exists": "errorResponse.fileAlreadyExists",
    "file-not-found": "errorResponse.fileNotFound",
    "insecure-password": "errorResponse.insecurePassword",
    "internal-error": "errorResponse.internalError",
    "intervenor-already-exists": "errorResponse.intervenorAlreadyExists",
    "intervenor-already-in-occurrence": "errorResponse.intervenorAlreadyInOccurrence",
    "intervenor-not-found": "errorResponse.intervenorNotFound",
    "intervenor-not-in-occurrence": "errorResponse.intervenorNotInOccurrence",
    "invalid-file": "errorResponse.invalidFile",
    "invalid-name": "errorResponse.invalidName",
    "occurrence-not-assigned-to-user": "errorResponse.occurrenceNotAssignedToUser",
    "occurrence-not-found": "errorResponse.occurrenceNotFound",
    "report-already-submitted-or-approved": "errorResponse.reportAlreadySubmittedOrApproved",
    "report-not-found": "errorResponse.reportNotFound",
    "reporter-not-found": "errorResponse.reporterNotFound",
    "role-already-exists": "errorResponse.roleAlreadyExists",
    "role-not-found": "errorResponse.roleNotFound",
    "type-already-exists": "errorResponse.typeAlreadyExists",
    "type-not-found": "errorResponse.typeNotFound",
    "user-not-admin": "errorResponse.userNotAdmin",
    "user-not-found": "errorResponse.userNotFound",
    "user-or-password-are-invalid": "errorResponse.userOrPasswordAreInvalid",
};

export function getErrorDescription(errorType: string): string {
    const key = errorDescriptions[errorType];
    if (!key) {
        return errorType;
    }

    return i18n.t(key);
}