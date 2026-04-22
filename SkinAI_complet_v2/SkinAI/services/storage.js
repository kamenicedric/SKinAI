import * as SecureStore from "expo-secure-store";

const API_KEY = "anthropic_api_key";
const HISTORY_KEY = "skin_history";

export async function saveApiKey(key) {
  await SecureStore.setItemAsync(API_KEY, key);
}

export async function getApiKey() {
  return await SecureStore.getItemAsync(API_KEY);
}

export async function deleteApiKey() {
  await SecureStore.deleteItemAsync(API_KEY);
}

export async function saveHistory(history) {
  await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(history));
}

export async function getHistory() {
  const raw = await SecureStore.getItemAsync(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}
