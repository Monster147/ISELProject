/*
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()
*/
import * as SecureStore from 'expo-secure-store'

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

    async saveAuthInfo(authInfo: AuthInfo): Promise<void> {
        //storage.set(this.TOKEN_KEY, authInfo.token)
        await SecureStore.setItemAsync(this.TOKEN_KEY, authInfo.token)
    }

    async getAuthInfo(): Promise<AuthInfo | null> {
        //const token = storage.getString(this.TOKEN_KEY)
        const token = await SecureStore.getItemAsync(this.TOKEN_KEY)
        if (!token) return null
        return {token}
    }

    async clearAuthInfo(): Promise<void> {
        //storage.delete(this.TOKEN_KEY)
        await SecureStore.deleteItemAsync(this.TOKEN_KEY)
    }
}

export const authInfoRepo = new AuthInfoPreferencesRepo()