import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'nexleads_auth_token';
const USER_KEY = 'nexleads_user_data';

export const tokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getUser(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(USER_KEY);
    } catch {
      return null;
    }
  },

  async setUser(user: object): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  async removeUser(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  },
};
