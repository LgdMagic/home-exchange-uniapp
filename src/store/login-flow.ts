/**
 * 登录流程内的临时状态。
 *
 * 用于在 pages/login/index.vue → pages/login/phone.vue → pages/login/verify.vue
 * 三个页面之间共享"是否已同意协议""当前选择的区号+手机号""验证码冷却秒数"，
 * 不通过页面跳转的 query 参数传递（见 design.md Uniapp 小节 Decisions 第 3 条）。
 *
 * 故意不持久化到 Storage：页面关闭/小程序重启后应从头开始登录流程，
 * 不应残留上一次输入的手机号或协议勾选状态。
 */

import { defineStore } from "pinia";
import { DEFAULT_COUNTRY_CODE } from "@/constants/regions";

interface LoginFlowState {
  agreedToTerms: boolean;
  countryCode: string;
  phoneNumber: string;
  /** 发送验证码接口返回的冷却秒数，驱动 verify.vue 倒计时初始值 */
  cooldownSeconds: number;
}

export const useLoginFlowStore = defineStore("loginFlow", {
  state: (): LoginFlowState => ({
    agreedToTerms: false,
    countryCode: DEFAULT_COUNTRY_CODE,
    phoneNumber: "",
    cooldownSeconds: 60,
  }),

  actions: {
    setAgreedToTerms(agreed: boolean) {
      this.agreedToTerms = agreed;
    },

    setPhone(countryCode: string, phoneNumber: string) {
      this.countryCode = countryCode;
      this.phoneNumber = phoneNumber;
    },

    setCooldownSeconds(seconds: number) {
      this.cooldownSeconds = seconds;
    },

    reset() {
      this.agreedToTerms = false;
      this.countryCode = DEFAULT_COUNTRY_CODE;
      this.phoneNumber = "";
      this.cooldownSeconds = 60;
    },
  },
});
