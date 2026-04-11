/*
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()
*/
import * as SecureStore from 'expo-secure-store'
import {User} from "../models/user/User";

export interface UserInfo{
    id: number;
    name: string;
    email: string;
    roles: number[];
}

export interface UserInfoRepo {

    saveUserInfo(userInfo: UserInfo): Promise<void>

    getUserInfo(): Promise<UserInfo | null>

    clearUserInfo(): Promise<void>
}

export class UserInfoPreferencesRepo implements UserInfoRepo {

    private USER_KEY = "userId"


    async saveUserInfo(userInfo: UserInfo): Promise<void> {
        await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(userInfo))
    }

    async getUserInfo(): Promise<UserInfo | null> {
        const user = await SecureStore.getItemAsync(this.USER_KEY)
        if (!user) return null
        return JSON.parse(user) as UserInfo
    }

    async clearUserInfo(): Promise<void> {
        await SecureStore.deleteItemAsync(this.USER_KEY)
    }
}

export const userInfoRepo = new UserInfoPreferencesRepo()