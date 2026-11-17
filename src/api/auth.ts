/**
 * customer-phone-auth 能力的 API 封装。
 *
 * Request/Response 字段已对照 home-exchange-server 源码核实（Controller/DTO/Service），
 * 详见 openspec/changes/add-customer-phone-login/design.md Uniapp 小节 Context / Decisions 第 5 条。
 *
 * ⚠️ 路径不带 `/api` 前缀：实际 Controller 为 `@Controller('customer/auth')`，
 * `main.ts` 未设置全局前缀，真实可用路径是 `/customer/auth/*`（已反馈 Backend Agent，
 * 其 design.md Backend 小节文档描述的 `/api/customer/` 与实现不一致）。
 */

import { http } from "@/utils/request";

export interface SendSmsCodeRequest {
  countryCode: string;
  phoneNumber: string;
}

export interface SendSmsCodeResponse {
  cooldownSeconds: number;
}

export function sendSmsCode(data: SendSmsCodeRequest) {
  return http.post<SendSmsCodeResponse, SendSmsCodeRequest>("/customer/auth/sms-code", data, {
    withAuth: false,
  });
}

export interface LoginWithSmsRequest {
  countryCode: string;
  phoneNumber: string;
  code: string;
  agreedToTerms: boolean;
}

export interface LoginWithWechatPhoneRequest {
  /** wx.getPhoneNumber 回调中返回的 code */
  code: string;
  agreedToTerms: boolean;
}

export interface LoginResultAccount {
  id: string;
  countryCode: string;
  phoneNumber: string;
  nickname: string | null;
  avatarUrl: string | null;
  isNewAccount: boolean;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  account: LoginResultAccount;
}

export function loginWithSms(data: LoginWithSmsRequest) {
  return http.post<LoginResult, LoginWithSmsRequest>("/customer/auth/login/sms", data, {
    withAuth: false,
  });
}

export function loginWithWechatPhone(data: LoginWithWechatPhoneRequest) {
  return http.post<LoginResult, LoginWithWechatPhoneRequest>(
    "/customer/auth/login/wechat-phone",
    data,
    { withAuth: false }
  );
}

/**
 * customer-phone-auth 专属错误码（20000-20099 段）→ 中文提示文案映射。
 *
 * 对应 home-exchange-server `src/modules/auth/constants/auth-error-code.ts`。
 * 查不到的错误码回退展示后端返回的 message（见 request.ts BusinessError），
 * 这里只是更友好的文案包装，不是校验逻辑本身。
 */
export const AUTH_ERROR_MESSAGE: Record<number, string> = {
  20001: "手机号格式不正确或该区号暂不支持",
  20002: "发送过于频繁，请 60 秒后再试",
  20003: "该手机号今日发送次数已达上限，请稍后再试",
  20004: "验证码已过期，请重新获取",
  20005: "验证码错误，请重新输入",
  20006: "验证码连续输错次数过多，请重新获取",
  20007: "请先阅读并同意《用户协议》和《隐私政策》",
  20008: "微信手机号授权失败，请重试",
};
