/**
 * 示例 API 模块：认证相关。
 *
 * 这里的 Path / Request / Response 仅为项目初始化阶段的占位示例，
 * 真实接口必须以 Backend Agent 维护的 home-exchange-server/docs/api.md
 * 为唯一依据对齐后再实现，不得自行假设字段与路径（见 .cursor/rules/front.md 第 9-13 节）。
 */

import { http } from "@/utils/request";
import type { UserInfo } from "@/store/user";

export interface LoginByWeixinRequest {
  code: string;
}

export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

export function loginByWeixin(data: LoginByWeixinRequest) {
  return http.post<LoginResponse, LoginByWeixinRequest>("/api/auth/login/weixin", data, {
    withAuth: false,
  });
}
