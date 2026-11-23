import { PROFILE_ERROR_MESSAGE, type ProfileView } from "@/api/profile";
import { useProfileStore } from "@/store/profile";
import { BusinessError } from "@/utils/request";

export type ProfileStepName = "basic" | "lifestyle" | "preferences" | "travel" | "preview";

const STEP_ORDER: ProfileStepName[] = ["basic", "lifestyle", "preferences", "travel", "preview"];

export const REAL_NAME_PATH = "/pages/profile/real-name";

const STEP_PATH: Record<ProfileStepName, string> = {
  basic: "/pages/profile/basic",
  lifestyle: "/pages/profile/lifestyle",
  preferences: "/pages/profile/preferences",
  travel: "/pages/profile/travel",
  preview: "/pages/profile/preview",
};

export function isRealNameSubmitted(profile: ProfileView): boolean {
  return profile.realNameStatus != null;
}

/** 未提交实名信息时先去实名页，否则进入资料里第一个未完成步骤。 */
export function setupEntryPath(profile: ProfileView): string | null {
  if (!isRealNameSubmitted(profile)) return REAL_NAME_PATH;
  return resumePath(profile);
}

export function resumeStep(profile: ProfileView): ProfileStepName | "done" {
  if (profile.profileCompletedAt) return "done";
  if (!profile.basicInfoCompletedAt) return "basic";
  if (!profile.lifestyleCompletedAt) return "lifestyle";
  if (!profile.accommodationTravelCompletedAt) return "preferences";
  return "preview";
}

export function resumePath(profile: ProfileView): string | null {
  const step = resumeStep(profile);
  return step === "done" ? null : STEP_PATH[step];
}

/** 登录成功后：未实名进实名页，资料未完成进对应步骤，已完成或读取失败时进入首页。 */
export async function enterAfterLogin() {
  try {
    const profile = await useProfileStore().load();
    const next = setupEntryPath(profile);
    if (next) {
      uni.reLaunch({ url: next });
      return;
    }
  } catch {
    // 资料状态读不到时仍离开登录页
  }
  uni.reLaunch({ url: "/pages/index/index" });
}

/** 允许回到已完成的步骤修改；未完成的后续步骤会被送回第一个未完成步骤。 */
export async function ensureProfileStep(expected: ProfileStepName): Promise<boolean> {
  const profile = await useProfileStore().load();
  if (!isRealNameSubmitted(profile)) {
    uni.redirectTo({ url: REAL_NAME_PATH });
    return false;
  }
  const resume = resumeStep(profile);
  if (resume === "done") {
    uni.showToast({ title: "个人资料已完成", icon: "none" });
    uni.switchTab({ url: "/pages/mine/index" });
    return false;
  }
  if (expected === "travel" && resume === "preferences") return true;
  if (STEP_ORDER.indexOf(expected) > STEP_ORDER.indexOf(resume)) {
    uni.redirectTo({ url: STEP_PATH[resume] });
    return false;
  }
  return true;
}

export function formatBirthDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isPersistableAvatar(url: string): boolean {
  return url.startsWith("https://");
}

export function showProfileError(error: unknown, fallback: string) {
  const message =
    error instanceof BusinessError
      ? (PROFILE_ERROR_MESSAGE[error.code] ?? (error.message || fallback))
      : fallback;
  uni.showToast({ title: message, icon: "none" });
}
