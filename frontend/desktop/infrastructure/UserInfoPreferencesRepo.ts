export interface UserInfo {
  id: number;
  name: string;
  email: string;
  roles: number[];
}

export interface UserInfoRepo {
  saveUserInfo(userInfo: UserInfo): Promise<void>;

  getUserInfo(): Promise<UserInfo | null>;

  clearUserInfo(): Promise<void>;
}

/**
 * Repositório de informação do utilizador para a versão desktop.
 * Persiste e recupera os dados do utilizador autenticado usando localStorage usando a chave "userId".
 */
export class UserInfoPreferencesRepo implements UserInfoRepo {
  private USER_KEY = "userId";

  async saveUserInfo(userInfo: UserInfo): Promise<void> {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
  }

  async getUserInfo(): Promise<UserInfo | null> {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user) return null;
    return JSON.parse(user) as UserInfo;
  }

  async clearUserInfo(): Promise<void> {
    localStorage.removeItem(this.USER_KEY);
  }
}

export const userInfoRepo = new UserInfoPreferencesRepo();
