
export const errorDescriptions: Record<string, string> = {
    "email-already-in-use":
        "There is already a user with given email address.",
    "evidence-not-found":
        "That evidence was not found. Please check the evidence and try again. If you continue to experience issues, please contact support for further assistance.",
    "insecure-password":
        "That is an absurd password without any guard!",
    "internal-error":
        "An unexpected internal error occurred.",
    "all-dices-are-selected":
        "All dice have already been selected.",
    "intervenor-already-exists":
        "That intervenor with the same name already exists. Please choose a different name or update the existing intervenor's information instead.",
    "intervenor-not-found":
        "That intervenor was not found. Please check the ID or contact info and try again.",
    "reporter-not-found":
        "That investigator is not found in the system. Please check the reporter's information and try again. If the problem persists, contact support for further assistance.",
    "role-already-exists":
        "That role already exists. Please choose a different name for the role you are trying to create.",
    "role-not-found":
        "No role was found or role does not exist.",
    "user-not-found":
        "No user was found with the provided information.",
    "user-or-password-are-invalid":
        "Invalid user or password. Please check your credentials and try again.",
}
export function getErrorDescription(errorType: string): string {
    return errorDescriptions[errorType] || errorType;
}