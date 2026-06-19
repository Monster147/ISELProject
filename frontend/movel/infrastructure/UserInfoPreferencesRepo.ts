/*
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()
*/
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../../commons/models/user/User";

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

export class UserInfoPreferencesRepo implements UserInfoRepo {
  private USER_KEY = "userId";

  async saveUserInfo(userInfo: UserInfo): Promise<void> {
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
  }

  async getUserInfo(): Promise<UserInfo | null> {
    const user = await AsyncStorage.getItem(this.USER_KEY);
    if (!user) return null;
    return JSON.parse(user) as UserInfo;
  }

  async clearUserInfo(): Promise<void> {
    await AsyncStorage.removeItem(this.USER_KEY);
  }
}

export const userInfoRepo = new UserInfoPreferencesRepo();
