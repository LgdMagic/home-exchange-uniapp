/**
 * 统一的 uni.request 封装。
 *
 * 职责（见 .cursor/rules/front.md 第 24、25、30、31 节）：
 * - 统一 Base URL（多环境通过 .env 的 VITE_API_BASE_URL 区分）
 * - 统一超时时间、Header（含登录态 Token）
 * - 统一错误拦截与 Loading 触发/收起
 * - 统一按后端 Response Envelope（code/message/data）解析业务数据
 *
 * 所有页面/业务模块必须通过本文件发起请求，不要在业务代码中直接调用 uni.request。
 * 具体 Response Envelope 结构、Error Code 含义以 Backend Agent 维护的
 * home-exchange-server/docs/api.md 为准，此处结构仅为占位约定，接入真实后端时需对齐确认。
 */

import { StorageKey, getStorage } from "./storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TIMEOUT = 10000;

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface RequestOptions<T = unknown> extends Omit<
  UniApp.RequestOptions,
  "url" | "success" | "fail" | "complete" | "data"
> {
  url: string;
  /** 是否需要携带登录态 Token，默认 true */
  withAuth?: boolean;
  /** 是否在请求期间显示全局 Loading，默认 false（由调用方按场景决定） */
  showLoading?: boolean;
  data?: T;
}

/** 业务错误：Error Code 非 0 时抛出，供调用方按 Error Code 做分支处理 */
export class BusinessError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = "BusinessError";
  }
}

let loadingCount = 0;

function showLoading() {
  loadingCount += 1;
  if (loadingCount === 1) {
    uni.showLoading({ title: "加载中...", mask: true });
  }
}

function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0) {
    uni.hideLoading();
  }
}

/** 统一 401 处理：清理登录态并跳转登录页；具体登录页路径以项目实际路由为准 */
function handleUnauthorized() {
  // TODO: 接入真实登录态管理后，调用 user store 的 logout，并跳转登录页。
  console.warn("[request] 登录态失效（401），请接入统一登出与登录页跳转逻辑");
}

export function request<T = unknown, D = unknown>(options: RequestOptions<D>): Promise<T> {
  const { url, withAuth = true, showLoading: needLoading = false, header, ...rest } = options;

  const finalHeader: Record<string, string> = {
    "Content-Type": "application/json",
    ...(header as Record<string, string>),
  };

  if (withAuth) {
    const token = getStorage<string>(StorageKey.TOKEN);
    if (token) {
      finalHeader.Authorization = `Bearer ${token}`;
    }
  }

  if (needLoading) {
    showLoading();
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      timeout: TIMEOUT,
      header: finalHeader,
      ...rest,
      data: rest.data as UniApp.RequestOptions["data"],
      success: (res) => {
        const { statusCode, data } = res;

        if (statusCode === 401) {
          handleUnauthorized();
          reject(new BusinessError(401, "登录已过期，请重新登录"));
          return;
        }

        if (statusCode === 403) {
          reject(new BusinessError(403, "没有权限执行此操作"));
          return;
        }

        if (statusCode && statusCode >= 500) {
          reject(new BusinessError(statusCode, "服务器开小差了，请稍后再试"));
          return;
        }

        const body = data as ApiResponse<T>;
        if (body && typeof body === "object" && "code" in body) {
          if (body.code === 0) {
            resolve(body.data);
          } else {
            reject(new BusinessError(body.code, body.message || "请求失败"));
          }
          return;
        }

        // 非标准 Envelope（例如本地 mock 或特殊接口），原样返回，调用方自行处理。
        resolve(data as T);
      },
      fail: (err) => {
        reject(new BusinessError(-1, err.errMsg || "网络异常，请检查网络连接"));
      },
      complete: () => {
        if (needLoading) {
          hideLoading();
        }
      },
    });
  });
}

export const http = {
  get: <T = unknown>(url: string, options?: Omit<RequestOptions, "url" | "method">) =>
    request<T>({ url, method: "GET", ...options }),
  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    options?: Omit<RequestOptions<D>, "url" | "method" | "data">
  ) => request<T, D>({ url, method: "POST", data, ...options }),
  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    options?: Omit<RequestOptions<D>, "url" | "method" | "data">
  ) => request<T, D>({ url, method: "PUT", data, ...options }),
  delete: <T = unknown>(url: string, options?: Omit<RequestOptions, "url" | "method">) =>
    request<T>({ url, method: "DELETE", ...options }),
};
