/**
 * 用户 / 登录态 Store。
 *
 * 说明（见 .cursor/rules/front.md 第 23、27、46.2、46.5 节）：
 * - 登录态（Access/Refresh Token、账号基本信息）既存内存（Pinia state，供响应式使用），
 *   也显式持久化到 Storage（跨小程序冷启动保留）。
 * - 小程序冷启动后 Pinia state 会重置，必须在 App onLaunch 中调用 restore() 恢复。
 * - 当前 Backend 未提供 Token 吊销 / 刷新接口（见 design.md Non-Goals、Risks 第 2 条），
 *   因此 logout() 只做本地清除，不调用任何后端接口；Access Token 过期后只能引导用户重新登录。
 */

import { defineStore } from "pinia";
import { StorageKey, getStorage, removeStorage, setStorage } from "@/utils/storage";
import type { LoginResult } from "@/api/auth";

export interface AccountInfo {
  id: string;
  countryCode: string;
  phoneNumber: string;
  nickname: string | null;
  avatarUrl: string | null;
}

interface UserState {
  accessToken: string | null;
  refreshToken: string | null;
  account: AccountInfo | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    accessToken: null,
    refreshToken: null,
    account: null,
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.accessToken),
  },

  actions: {
    /** App 冷启动时调用，从 Storage 恢复登录态到内存 */
    restore() {
      this.accessToken = getStorage<string>(StorageKey.ACCESS_TOKEN);
      this.refreshToken = getStorage<string>(StorageKey.REFRESH_TOKEN);
      this.account = getStorage<AccountInfo>(StorageKey.ACCOUNT);
    },

    /** 登录成功（微信一键登录 / 手机号验证码登录均调用此方法）后写入内存与 Storage */
    login(result: LoginResult) {
      const { accessToken, refreshToken, account } = result;
      const accountInfo: AccountInfo = {
        id: account.id,
        countryCode: account.countryCode,
        phoneNumber: account.phoneNumber,
        nickname: account.nickname,
        avatarUrl: account.avatarUrl,
      };

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.account = accountInfo;

      setStorage(StorageKey.ACCESS_TOKEN, accessToken);
      setStorage(StorageKey.REFRESH_TOKEN, refreshToken);
      setStorage(StorageKey.ACCOUNT, accountInfo);
    },

    /** 资料页保存昵称或头像后，同步登录态里的账号信息 */
    updateIdentity(partial: Partial<Pick<AccountInfo, "nickname" | "avatarUrl">>) {
      if (!this.account) return;
      this.account = { ...this.account, ...partial };
      setStorage(StorageKey.ACCOUNT, this.account);
    },

    /** 登出：清空内存与 Storage，仅本地操作（Backend 无登出/吊销接口） */
    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.account = null;
      removeStorage(StorageKey.ACCESS_TOKEN);
      removeStorage(StorageKey.REFRESH_TOKEN);
      removeStorage(StorageKey.ACCOUNT);
    },
  },
});
