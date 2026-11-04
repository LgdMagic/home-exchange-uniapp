/**
 * 用户 / 登录态 Store 示例。
 *
 * 说明（见 .cursor/rules/front.md 第 23、27、46.2、46.5 节）：
 * - 登录态（Token、用户基本信息）既存内存（Pinia state，供响应式使用），
 *   也显式持久化到 Storage（跨小程序冷启动保留）。
 * - 小程序冷启动后 Pinia state 会重置，必须在 App onLaunch 中调用 restore() 恢复。
 * - 这里只是基础示例，真实登录流程（手机号/验证码、微信 code2Session 等）
 *   需按已评审的 OpenSpec Change 和 Backend API Contract 实现，不得自行假设。
 */

import { defineStore } from "pinia";
import { StorageKey, getStorage, removeStorage, setStorage } from "@/utils/storage";

export interface UserInfo {
  userId: string;
  nickname?: string;
  avatar?: string;
}

interface UserState {
  token: string | null;
  userInfo: UserInfo | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    token: null,
    userInfo: null,
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.token),
  },

  actions: {
    /** App 冷启动时调用，从 Storage 恢复登录态到内存 */
    restore() {
      this.token = getStorage<string>(StorageKey.TOKEN);
      this.userInfo = getStorage<UserInfo>(StorageKey.USER_INFO);
    },

    /** 登录成功后调用，同步写入内存与 Storage */
    setSession(token: string, userInfo: UserInfo) {
      this.token = token;
      this.userInfo = userInfo;
      setStorage(StorageKey.TOKEN, token);
      setStorage(StorageKey.USER_INFO, userInfo);
    },

    /** 登出：清空内存与 Storage，调用方负责跳转登录页 */
    logout() {
      this.token = null;
      this.userInfo = null;
      removeStorage(StorageKey.TOKEN);
      removeStorage(StorageKey.USER_INFO);
    },
  },
});
