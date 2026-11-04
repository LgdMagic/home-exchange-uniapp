/**
 * 统一的本地持久化存储封装。
 *
 * 说明（见 .cursor/rules/front.md 第 23、46.5 节）：
 * - uni-app 多端运行，底层存储能力由 uni.setStorageSync / uni.getStorageSync 等 API 提供；
 *   不直接使用 window.localStorage，保证小程序端可用。
 * - 只用于存放登录态 Token、用户基本信息等需要跨冷启动保留的数据，
 *   不要把所有业务数据都塞进 Storage。
 */

export const StorageKey = {
  TOKEN: "home_exchange_token",
  USER_INFO: "home_exchange_user_info",
} as const;

export function getStorage<T = unknown>(key: string): T | null {
  try {
    const value = uni.getStorageSync(key);
    return value === "" ? null : (value as T);
  } catch (error) {
    console.error(`[storage] getStorage(${key}) failed`, error);
    return null;
  }
}

export function setStorage<T = unknown>(key: string, value: T): void {
  try {
    uni.setStorageSync(key, value);
  } catch (error) {
    console.error(`[storage] setStorage(${key}) failed`, error);
  }
}

export function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(key);
  } catch (error) {
    console.error(`[storage] removeStorage(${key}) failed`, error);
  }
}

export function clearStorage(): void {
  try {
    uni.clearStorageSync();
  } catch (error) {
    console.error(`[storage] clearStorage failed`, error);
  }
}
