export interface UserInfo {
  id: number;
  name: string;
  email: string;
  roles: number[];
}

export interface AuthInfo {
  token: string;
}

export interface AuthInfoRepo {
  saveAuthInfo(authInfo: AuthInfo): Promise<void>;

  getAuthInfo(): Promise<AuthInfo | null>;

  clearAuthInfo(): Promise<void>;
}

/**
 * Repositório de informação de autenticação para a versão desktop.
 * Persiste e recupera o token de sessão usando localStorage usando a chave "token".
 */
export class AuthInfoPreferencesRepo implements AuthInfoRepo {
  private TOKEN_KEY = "token";

  async saveAuthInfo(authInfo: AuthInfo) {
    localStorage.setItem(this.TOKEN_KEY, authInfo.token);
  }

  async getAuthInfo() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;
    return { token };
  }

  async clearAuthInfo() {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

export const authInfoRepo = new AuthInfoPreferencesRepo();
