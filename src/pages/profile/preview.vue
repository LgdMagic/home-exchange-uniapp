<template>
  <profile-scaffold
    v-if="profile"
    title="我的资料"
    button-text="完成，解锁第一次生活交换"
    :submitting="submitting"
    @submit="onSubmit"
  >
    <view class="summary">
      <image
        v-if="profile.avatarUrl"
        class="summary__avatar"
        :src="profile.avatarUrl"
        mode="aspectFill"
      />
      <view v-else class="summary__fallback">
        <text class="summary__letter">{{ avatarLetter }}</text>
      </view>
      <view class="summary__main">
        <text class="summary__name">{{ profile.nickname || "未填写昵称" }}</text>
        <view class="summary__badges">
          <view v-if="profile.realName" class="summary__badge">
            <view class="summary__badge-mark"></view>
            <text class="summary__badge-text">已经完成实名认证</text>
          </view>
          <view v-if="profile.phoneNumber" class="summary__badge">
            <view class="summary__badge-mark"></view>
            <text class="summary__badge-text">手机已验证</text>
          </view>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card__head">
        <view class="card__bar"></view>
        <text class="card__title">基础信息</text>
      </view>
      <view class="rows">
        <view v-for="row in basicRows" :key="row.label" class="rows__item">
          <text class="rows__label">{{ row.label }}</text>
          <text class="rows__value">{{ row.value }}</text>
        </view>
      </view>
    </view>

    <view v-if="profile.bio" class="card">
      <view class="card__head">
        <view class="card__bar"></view>
        <text class="card__title">关于我 About Me</text>
      </view>
      <text class="preview-bio">{{ profile.bio }}</text>
    </view>

    <view v-if="lifeTags.length" class="card">
      <view class="card__head">
        <view class="card__bar"></view>
        <text class="card__title">我的生活</text>
      </view>
      <view class="tags">
        <view
          v-for="tag in lifeTags"
          :key="tag"
          class="tags__item"
          :class="{ 'tags__item--half': tag.length > 6 }"
        >
          <text class="tags__text">{{ tag }}</text>
        </view>
      </view>
    </view>

    <view v-if="travelTags.length" class="card">
      <view class="card__head">
        <view class="card__bar"></view>
        <text class="card__title">旅行风格</text>
      </view>
      <view class="tags">
        <view
          v-for="tag in travelTags"
          :key="tag"
          class="tags__item"
          :class="{ 'tags__item--half': tag.length > 6 }"
        >
          <text class="tags__text">{{ tag }}</text>
        </view>
      </view>
    </view>
  </profile-scaffold>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import ProfileScaffold from "@/components/profile/profile-scaffold.vue";
import { cityLabel } from "@/constants/cities";
import {
  ATMOSPHERE_OPTIONS,
  CITY_EXPLORATION_OPTIONS,
  DRINKING_OPTIONS,
  GENDER_OPTIONS,
  HAS_PETS_OPTIONS,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
  LIFESTYLE_TIDINESS_OPTIONS,
  PET_ATTITUDE_OPTIONS,
  SLEEP_SCHEDULE_OPTIONS,
  SMOKING_OPTIONS,
  TRAVEL_COMPANION_OPTIONS,
  TRAVEL_FREQUENCY_OPTIONS,
  TRAVEL_STYLE_OPTIONS,
  optionLabel,
  type ProfileOption,
} from "@/constants/profile-options";
import { completeProfile } from "@/api/profile";
import { useProfileStore } from "@/store/profile";
import { useUserStore } from "@/store/user";
import { ensureProfileStep, formatBirthDate, showProfileError } from "@/utils/profile-flow";

const userStore = useUserStore();
const profileStore = useProfileStore();
const submitting = ref(false);
const profile = computed(() => profileStore.profile);

const avatarLetter = computed(() => (profile.value?.nickname || "名").slice(0, 1));

const basicRows = computed(() => {
  const current = profile.value;
  if (!current) return [];
  const birth = formatBirthDate(current.birthDate);
  const rows = [
    { label: "真实姓名", value: current.realName || "—" },
    { label: "性别", value: optionLabel(GENDER_OPTIONS, current.gender) || "—" },
    { label: "出生日期", value: birth ? birth.slice(0, 7) : "—" },
  ];
  if (current.occupation) rows.push({ label: "职业", value: current.occupation });
  rows.push(
    { label: "所在城市", value: cityLabel(current.city) || "—" },
    { label: "联系电话", value: current.phoneNumber || "—" }
  );
  return rows;
});

function tagLabels(options: ProfileOption[], value: string | string[] | null | undefined): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.map((item) => optionLabel(options, item)).filter(Boolean);
}

const lifeTags = computed(() => {
  const current = profile.value;
  if (!current) return [];
  return [
    ...tagLabels(SLEEP_SCHEDULE_OPTIONS, current.sleepSchedule),
    ...tagLabels(ATMOSPHERE_OPTIONS, current.atmospherePreference),
    ...tagLabels(DRINKING_OPTIONS, current.drinking),
    ...tagLabels(SMOKING_OPTIONS, current.smoking),
    ...tagLabels(HAS_PETS_OPTIONS, current.hasPets),
    ...tagLabels(PET_ATTITUDE_OPTIONS, current.petAttitude),
    ...tagLabels(LIFESTYLE_TIDINESS_OPTIONS, current.lifestyleTidiness),
    ...tagLabels(INTEREST_OPTIONS, current.interests),
  ];
});

const travelTags = computed(() => {
  const current = profile.value;
  if (!current) return [];
  return [
    ...tagLabels(TRAVEL_COMPANION_OPTIONS, current.travelCompanions),
    ...tagLabels(TRAVEL_STYLE_OPTIONS, current.travelStyles),
    ...tagLabels(CITY_EXPLORATION_OPTIONS, current.cityExplorationStyles),
    ...tagLabels(TRAVEL_FREQUENCY_OPTIONS, current.travelFrequency),
    ...tagLabels(LANGUAGE_OPTIONS, current.languages),
  ];
});

onLoad(async () => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: "/pages/login/index" });
    return;
  }
  try {
    await ensureProfileStep("preview");
  } catch (error) {
    showProfileError(error, "资料加载失败");
  }
});

async function onSubmit() {
  if (submitting.value) return;
  submitting.value = true;
  try {
    await completeProfile();
    await profileStore.load();
    uni.navigateTo({ url: "/pages/living-days/index" });
  } catch (error) {
    showProfileError(error, "提交失败，请稍后再试");
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss">
@import "../../styles/profile-card.scss";

.rows {
  margin-top: 36rpx;
}

.preview-bio {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333333;
}

.tags {
  margin-top: 32rpx;
  display: flex;
  flex-wrap: wrap;
  column-gap: 12rpx;
  row-gap: 27rpx;
}

.tags__item {
  width: calc((100% - 24rpx) / 3);
  height: 60rpx;
  padding: 0 8rpx;
  border: 1rpx solid #808080;
  border-radius: 30rpx;
  background-color: #f8f6f2;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tags__item--half {
  width: calc((100% - 12rpx) / 2);
}

.tags__text {
  font-size: 29rpx;
  line-height: 1.2;
  color: #808080;
  text-align: center;
  white-space: nowrap;
}
</style>
