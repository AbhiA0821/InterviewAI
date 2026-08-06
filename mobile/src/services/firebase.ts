import * as SecureStore from 'expo-secure-store';
import { UserProfile } from '../types/auth';

const USER_STORAGE_KEY = 'interviewai_user_profile';
const TOKEN_STORAGE_KEY = 'interviewai_id_token';

/**
 * Save authenticated user profile securely on device
 */
export async function saveSecureUser(user: UserProfile, token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user));
    await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.warn('SecureStore save error:', error);
  }
}

/**
 * Load cached user session from device secure storage
 */
export async function getSecureUser(): Promise<{ user: UserProfile | null; token: string | null }> {
  try {
    const userStr = await SecureStore.getItemAsync(USER_STORAGE_KEY);
    const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return { user, token };
  } catch (error) {
    console.warn('SecureStore get error:', error);
    return { user: null, token: null };
  }
}

/**
 * Clear cached user session on logout
 */
export async function clearSecureUser(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.warn('SecureStore delete error:', error);
  }
}
