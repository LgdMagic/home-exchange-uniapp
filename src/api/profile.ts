/**
 * customer-profile 接口。路径与字段对照
 * home-exchange-server `CustomerProfileController` / `AccountController` 的实现。
 * docs/api.md 尚未收录这组接口，此处以已实现的 Controller / DTO 为准。
 */

import { BusinessError, http, uploadFile } from "@/utils/request";

export type ProfileStep = "BASIC_INFO" | "LIFESTYLE" | "ACCOMMODATION_TRAVEL" | "COMPLETED";

export interface ProfileView {
  /** null 表示尚未提交；PENDING 表示已提交、待核验。不能当成「已实名认证」。 */
  realNameStatus: "PENDING" | null;
  realName: string | null;
  birthDate: string | null;
  phoneNumber: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  gender: "MALE" | "FEMALE" | null;
  city: string | null;
  occupation: string | null;
  bio: string | null;
  sleepSchedule: string | null;
  atmospherePreference: string | null;
  drinking: string | null;
  smoking: string | null;
  hasPets: string | null;
  petAttitude: string | null;
  lifestyleTidiness: string | null;
  interests: string[];
  homeTypes: string[];
  spaceFeatures: string[];
  livingNeeds: string[];
  travelCompanions: string[];
  travelStyles: string[];
  cityExplorationStyles: string[];
  travelFrequency: string | null;
  languages: string[];
  currentStep: ProfileStep;
  basicInfoCompletedAt: string | null;
  lifestyleCompletedAt: string | null;
  accommodationTravelCompletedAt: string | null;
  profileCompletedAt: string | null;
}

export interface UpdateBasicInfoRequest {
  gender: "MALE" | "FEMALE";
  city: string;
  occupation?: string;
  bio?: string;
}

export interface UpdateLifestyleRequest {
  sleepSchedule: string;
  atmospherePreference: string;
  drinking: string;
  smoking: string;
  hasPets: string;
  petAttitude: string;
  lifestyleTidiness: string;
  interests: string[];
}

export interface UpdateAccommodationTravelRequest {
  homeTypes: string[];
  spaceFeatures: string[];
  livingNeeds: string[];
  travelCompanions: string[];
  travelStyles: string[];
  cityExplorationStyles: string[];
  travelFrequency: string;
  languages: string[];
}

export interface SubmitRealNameRequest {
  realName: string;
  idCardNumber: string;
}

export interface RealNameVerificationView {
  submitted: boolean;
  status: "PENDING" | null;
  realName: string | null;
  birthDate: string | null;
  /** 人像面是否已上传。未提交时也可以是 true，表示还可以更换。 */
  idCardFrontUploaded: boolean;
  /** 国徽面是否已上传。 */
  idCardBackUploaded: boolean;
}

export type IdCardPhotoSide = "FRONT" | "BACK";

const MAX_ID_CARD_PHOTO_BYTES = 5 * 1024 * 1024;

export interface UpdateWechatIdentityRequest {
  nickname?: string;
  avatarUrl?: string;
}

const saving = { showLoading: true } as const;

export function getProfile() {
  return http.get<ProfileView>("/customer/profile");
}

export function getRealNameVerification() {
  return http.get<RealNameVerificationView>("/customer/real-name-verification");
}

function readLocalFileSize(filePath: string): Promise<number | null> {
  return new Promise((resolve) => {
    uni.getFileInfo({
      filePath,
      success: (info) => resolve(info.size),
      fail: () => resolve(null),
    });
  });
}

/** 把头像上传到对象存储，返回可保存的 HTTPS 地址。 */
export function uploadAvatar(filePath: string) {
  return uploadFile<{ avatarUrl: string }>({
    url: "/customer/account/avatar",
    filePath,
    name: "file",
    showLoading: true,
  });
}

/** 上传身份证人像面或国徽面。同一面再次上传会覆盖。接口不返回图片地址。 */
export async function uploadIdCardPhoto(filePath: string, side: IdCardPhotoSide) {
  const size = await readLocalFileSize(filePath);
  if (size !== null && size > MAX_ID_CARD_PHOTO_BYTES) {
    throw new BusinessError(21009, "证件照片需为 5MB 以内的 JPG 或 PNG");
  }
  return uploadFile<{ uploaded: true }>({
    url: "/customer/real-name-verification/id-card-photo",
    filePath,
    name: "file",
    formData: { side },
    showLoading: true,
  });
}

export function submitRealNameVerification(data: SubmitRealNameRequest) {
  return http.post<{ success: true }, SubmitRealNameRequest>(
    "/customer/real-name-verification",
    data,
    saving
  );
}

export function updateBasicInfo(data: UpdateBasicInfoRequest) {
  return http.put<{ success: true }, UpdateBasicInfoRequest>(
    "/customer/profile/basic-info",
    data,
    saving
  );
}

export function updateLifestyle(data: UpdateLifestyleRequest) {
  return http.put<{ success: true }, UpdateLifestyleRequest>(
    "/customer/profile/lifestyle",
    data,
    saving
  );
}

export function updateAccommodationTravel(data: UpdateAccommodationTravelRequest) {
  return http.put<{ success: true }, UpdateAccommodationTravelRequest>(
    "/customer/profile/accommodation-travel",
    data,
    saving
  );
}

export function completeProfile() {
  return http.post<{ success: true }>("/customer/profile/complete", undefined, saving);
}

export function updateWechatIdentity(data: UpdateWechatIdentityRequest) {
  // 小程序请求不支持 PATCH，服务端同一路由同时接受 PUT。
  return http.put<{ success: true }, UpdateWechatIdentityRequest>(
    "/customer/account/wechat-identity",
    data,
    saving
  );
}

export const PROFILE_ERROR_MESSAGE: Record<number, string> = {
  21001: "请先完成上一步",
  21003: "请先完成个人资料",
  21004: "请先提交实名信息",
  21005: "身份证号格式不正确",
  21006: "该身份证号已被使用",
  21007: "实名信息已提交，不能修改",
  21009: "证件照片需为 5MB 以内的 JPG 或 PNG",
};
