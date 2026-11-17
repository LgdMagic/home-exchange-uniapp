/**
 * 支持的国家/地区区号清单。
 *
 * ⚠️ 这是 home-exchange-server `src/modules/auth/constants/supported-regions.ts` 的只读镜像，
 * 仅用于前端展示选项，不是格式校验的权威来源（见 .cursor/rules/front.md 第 22 节、
 * openspec/changes/add-customer-phone-login/design.md Uniapp 小节 Decisions 第 4 条）。
 *
 * 真正的格式/清单校验以后端返回的 20001 PHONE_FORMAT_INVALID 错误为准。
 * 若后端清单发生变化，需要同步手动更新这里（后端清单变化频率低，暂不做成动态接口）。
 */

export interface Region {
  countryCode: string;
  label: string;
}

export const SUPPORTED_REGIONS: readonly Region[] = [
  { countryCode: "+86", label: "中国大陆" },
  { countryCode: "+852", label: "中国香港" },
  { countryCode: "+853", label: "中国澳门" },
  { countryCode: "+886", label: "中国台湾" },
  { countryCode: "+1", label: "美国/加拿大" },
  { countryCode: "+65", label: "新加坡" },
  { countryCode: "+61", label: "澳大利亚" },
  { countryCode: "+44", label: "英国" },
  { countryCode: "+81", label: "日本" },
  { countryCode: "+82", label: "韩国" },
] as const;

export const DEFAULT_COUNTRY_CODE = "+86";

export function findRegion(countryCode: string): Region | undefined {
  return SUPPORTED_REGIONS.find((region) => region.countryCode === countryCode);
}

export function findRegionIndex(countryCode: string): number {
  const index = SUPPORTED_REGIONS.findIndex((region) => region.countryCode === countryCode);
  return index === -1 ? 0 : index;
}
