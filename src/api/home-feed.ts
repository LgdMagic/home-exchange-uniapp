import { http } from "@/utils/request";

export interface HomeFeedInspiration {
  imageKey: string;
  title: string;
  subtitle: string;
}

export interface HomeFeedMoment {
  period: string;
  text: string;
}

export interface HomeFeed {
  today: {
    imageKey: string;
    place: string;
    description: string;
    tags: string[];
    weatherText: string;
    livingTipTitle: string;
    livingTipBody: string;
  };
  inspirations: HomeFeedInspiration[];
  story: {
    imageKey: string;
    avatarKey: string;
    memberName: string;
    statusText: string;
    quote: string;
    timeText: string;
  };
  weekend: {
    imageKey: string;
    place: string;
    watchingText: string;
    startedText: string;
    durationText: string;
  };
  belong: {
    imageKey: string;
    title: string;
    moments: HomeFeedMoment[];
  };
}

export function getHomeFeed() {
  return http.get<HomeFeed>("/customer/home-feed", { withAuth: false });
}

/** https 地址直接显示；其余键对应设计稿导出的本地图片。 */
export function homeImageSrc(key: string): string {
  if (key.startsWith("https://")) return key;
  return `/static/home/${key}.jpg`;
}
