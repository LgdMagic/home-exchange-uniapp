/**
 * 个人资料选项。value 与 home-exchange-server
 * `src/modules/customer-profile/constants/profile-options.ts` 的代码一致，
 * label 使用 spec 中的中文文案。
 */

export interface ProfileOption {
  value: string;
  label: string;
}

export const GENDER_OPTIONS: ProfileOption[] = [
  { value: "MALE", label: "男" },
  { value: "FEMALE", label: "女" },
];

export const SLEEP_SCHEDULE_OPTIONS: ProfileOption[] = [
  { value: "EARLY_BIRD", label: "早睡早起" },
  { value: "REGULAR", label: "规律作息" },
  { value: "NIGHT_OWL", label: "夜猫子" },
];

export const ATMOSPHERE_OPTIONS: ProfileOption[] = [
  { value: "QUIET", label: "安静" },
  { value: "CASUAL", label: "随性" },
  { value: "LIVELY", label: "热闹" },
];

export const DRINKING_OPTIONS: ProfileOption[] = [
  { value: "NONE", label: "不饮酒" },
  { value: "OCCASIONAL", label: "偶尔" },
  { value: "FREQUENT", label: "经常" },
];

export const SMOKING_OPTIONS: ProfileOption[] = [
  { value: "NONE", label: "不吸烟" },
  { value: "OCCASIONAL", label: "偶尔" },
  { value: "FREQUENT", label: "经常" },
];

export const HAS_PETS_OPTIONS: ProfileOption[] = [
  { value: "HAS_PETS", label: "有宠物" },
  { value: "NO_PETS", label: "没有宠物" },
];

export const PET_ATTITUDE_OPTIONS: ProfileOption[] = [
  { value: "LIKE", label: "喜欢宠物" },
  { value: "ACCEPTABLE", label: "可以接受宠物" },
  { value: "DISLIKE", label: "不太接受宠物" },
];

export const LIFESTYLE_TIDINESS_OPTIONS: ProfileOption[] = [
  { value: "TIDY", label: "整洁有序" },
  { value: "CLEAN_ENOUGH", label: "干净即可" },
  { value: "CASUAL", label: "随性" },
];

export const INTEREST_OPTIONS: ProfileOption[] = [
  { value: "PHOTOGRAPHY", label: "摄影" },
  { value: "HIKING", label: "徒步" },
  { value: "COFFEE", label: "咖啡" },
  { value: "READING", label: "阅读" },
  { value: "MUSIC", label: "音乐" },
  { value: "ART", label: "艺术" },
  { value: "TRAVEL", label: "旅行" },
  { value: "COOKING", label: "做饭" },
  { value: "MOVIES", label: "电影" },
  { value: "CYCLING", label: "骑行" },
  { value: "CAMPING", label: "露营" },
  { value: "CITY_WALK", label: "城市漫游" },
];

export const HOME_TYPE_OPTIONS: ProfileOption[] = [
  { value: "URBAN_RESIDENCE", label: "城市住宅" },
  { value: "APARTMENT", label: "公寓" },
  { value: "GARDEN_HOUSE", label: "花园洋房" },
  { value: "LOFT_DUPLEX", label: "复式/LOFT" },
  { value: "DETACHED_HOUSE", label: "独栋别墅" },
  { value: "TOWNHOUSE", label: "联排别墅" },
  { value: "COURTYARD", label: "院落/四合院" },
  { value: "HERITAGE_HOUSE", label: "老洋房/老宅" },
  { value: "UNIQUE_STAY", label: "特色住宅" },
];

export const SPACE_FEATURE_OPTIONS: ProfileOption[] = [
  { value: "YARD", label: "有院子" },
  { value: "PLANTS_FLOWERS", label: "有鲜花/植物" },
  { value: "BALCONY", label: "有阳台" },
  { value: "TERRACE", label: "有露台" },
  { value: "QUIET", label: "安静" },
  { value: "GOOD_LIGHT", label: "采光好" },
  { value: "GOOD_VENTILATION", label: "通风好" },
  { value: "NATURE_VIEW", label: "有自然景观" },
  { value: "KITCHEN", label: "有厨房" },
  { value: "OUTDOOR_SPACE", label: "有户外空间" },
];

export const LIVING_NEED_OPTIONS: ProfileOption[] = [
  { value: "SMOKE_FREE", label: "无烟" },
  { value: "SOFT_BED", label: "喜欢软床" },
  { value: "KITCHEN", label: "有厨房" },
  { value: "WIFI", label: "有 Wi-Fi" },
  { value: "WASHING_MACHINE", label: "有洗衣机" },
  { value: "LONG_TERM_FRIENDLY", label: "适合长住" },
  { value: "PET_FRIENDLY", label: "宠物友好" },
];

export const TRAVEL_COMPANION_OPTIONS: ProfileOption[] = [
  { value: "SOLO", label: "独自旅行" },
  { value: "WITH_FRIENDS", label: "和朋友一起" },
  { value: "WITH_PARTNER", label: "和伴侣一起" },
  { value: "WITH_FAMILY", label: "和家人一起" },
];

export const TRAVEL_STYLE_OPTIONS: ProfileOption[] = [
  { value: "SLOW_TRAVEL", label: "慢旅行" },
  { value: "CITY_WALK", label: "城市漫游" },
  { value: "FOOD_EXPLORATION", label: "美食探索" },
  { value: "NATURE_EXPLORATION", label: "自然探索" },
  { value: "CULTURAL_EXPERIENCE", label: "文化体验" },
  { value: "PHOTOGRAPHY", label: "摄影" },
  { value: "OUTDOOR", label: "户外" },
  { value: "WEEKEND_TRIP", label: "周末短途" },
];

export const CITY_EXPLORATION_OPTIONS: ProfileOption[] = [
  { value: "LIVE_LIKE_LOCAL", label: "像当地人一样生活" },
  { value: "LOCAL_SHOPS", label: "逛当地的小店" },
  { value: "FAVORITE_CAFE", label: "找一家喜欢的咖啡馆" },
  { value: "MEET_LOCALS", label: "认识当地的人" },
  { value: "EXPLORE_ON_FOOT", label: "徒步探索城市" },
  { value: "EXHIBITIONS_SHOWS", label: "看展览/看演出" },
];

export const TRAVEL_FREQUENCY_OPTIONS: ProfileOption[] = [
  { value: "RARELY", label: "偶尔" },
  { value: "TWO_TO_THREE_PER_YEAR", label: "每年 2-3 次" },
  { value: "FOUR_TO_SIX_PER_YEAR", label: "每年 4-6 次" },
  { value: "FREQUENT", label: "经常旅行" },
];

export const LANGUAGE_OPTIONS: ProfileOption[] = [
  { value: "ZH", label: "中文" },
  { value: "EN", label: "英语" },
  { value: "JA", label: "日语" },
  { value: "KO", label: "韩语" },
  { value: "OTHER", label: "其他" },
];

/** 旧的「独栋/联排别墅」在再次编辑时拆成两个独立选项。 */
export function expandHomeTypes(values: string[]): string[] {
  const next = new Set(values);
  if (next.has("VILLA_TOWNHOUSE")) {
    next.delete("VILLA_TOWNHOUSE");
    next.add("DETACHED_HOUSE");
    next.add("TOWNHOUSE");
  }
  return [...next];
}

export function optionLabel(options: ProfileOption[], value: string | null | undefined): string {
  if (!value) return "";
  return options.find((item) => item.value === value)?.label ?? value;
}

export function optionLabels(options: ProfileOption[], values: string[]): string {
  return values
    .map((value) => optionLabel(options, value))
    .filter(Boolean)
    .join("、");
}
