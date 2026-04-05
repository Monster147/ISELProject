
export const errorDescriptions: Record<string, string> = {
    "duplicate-users-ids":
        "The provided list of user IDs contains duplicates. Please ensure each user ID is unique and try again.",
    "email-already-in-use":
        "There is already a user with given email address.",
    "end-date-not-valid":
        "The provided end date is not valid. Please ensure the end date is today or a future date and try again.",
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
    "intervenor-already-in-occurrence":
        "That intervenor is already associated with this occurrence.",
    "intervenor-not-found":
        "That intervenor was not found. Please check the ID or contact info and try again.",
    "intervenor-not-in-occurrence":
        "That intervenor is not associated with this occurrence.",
    "occurrence-not-assigned-to-user":
        "This occurrence is not assigned to your account, so you can't create a report for it.",
    "occurrence-not-found":
        "No occurrence was found with the provided information.",
    "reporter-not-found":
        "That investigator is not found in the system. Please check the reporter's information and try again. If the problem persists, contact support for further assistance.",
    "role-already-exists":
        "That role already exists. Please choose a different name for the role you are trying to create.",
    "role-not-found":
        "No role was found or role does not exist.",
    "user-not-admin":
        "User is not authorized to perform this action. Admin privileges are required.",
    "user-not-found":
        "No user was found with the provided information.",
    "user-or-password-are-invalid":
        "Invalid user or password. Please check your credentials and try again.",
}
export function getErrorDescription(errorType: string): string {
    return errorDescriptions[errorType] || errorType;
}