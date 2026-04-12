export interface UserInfo{
    id: number;
    name: string;
    email: string;
    roles: number[];
}

export interface AuthInfo {
    token: string
}

export interface AuthInfoRepo {

    saveAuthInfo(authInfo: AuthInfo): Promise<void>

    getAuthInfo(): Promise<AuthInfo | null>

    clearAuthInfo(): Promise<void>
}

export class AuthInfoPreferencesRepo implements AuthInfoRepo {

    private TOKEN_KEY = "token"

    async saveAuthInfo(authInfo: AuthInfo) {
        localStorage.setItem(this.TOKEN_KEY, authInfo.token)
    }

    async getAuthInfo() {
        const token = localStorage.getItem(this.TOKEN_KEY)
        return token ? { token } : null
    }

    async clearAuthInfo() {
        localStorage.removeItem(this.TOKEN_KEY)
    }
}

export const authInfoRepo = new AuthInfoPreferencesRepo()