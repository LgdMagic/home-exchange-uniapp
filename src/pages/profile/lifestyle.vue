<template>
  <profile-scaffold
    v-if="ready"
    title="个人资料"
    :step="2"
    button-text="下一步"
    :submitting="submitting"
    @submit="onSubmit"
  >
    <view class="card">
      <view class="card__head">
        <view class="card__bar"></view>
        <text class="card__title">我的生活方式</text>
      </view>
      <option-chips v-model="sleepSchedule" label="作息" :options="SLEEP_SCHEDULE_OPTIONS" />
      <option-chips
        v-model="atmospherePreference"
        label="我喜欢的氛围"
        :options="ATMOSPHERE_OPTIONS"
      />
      <option-chips v-model="drinking" label="饮酒" :options="DRINKING_OPTIONS" />
      <option-chips v-model="smoking" label="吸烟" :options="SMOKING_OPTIONS" />
      <option-chips v-model="hasPets" label="宠物情况" :options="HAS_PETS_OPTIONS" />
      <option-chips v-model="petAttitude" label="我对宠物的态度" :options="PET_ATTITUDE_OPTIONS" />
      <option-chips
        v-model="lifestyleTidiness"
        label="我喜欢的生活状态"
        :options="LIFESTYLE_TIDINESS_OPTIONS"
      />
    </view>

    <view class="card">
      <view class="card__head">
        <view class="card__bar"></view>
        <text class="card__title">兴趣爱好</text>
      </view>
      <text class="card__desc">选择你感兴趣的标签，帮助匹配志同道合的房主/房客</text>
      <option-chips v-model="interests" label="我喜欢" :options="INTEREST_OPTIONS" multiple />
    </view>
  </profile-scaffold>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import OptionChips from "@/components/profile/option-chips.vue";
import ProfileScaffold from "@/components/profile/profile-scaffold.vue";
import {
  ATMOSPHERE_OPTIONS,
  DRINKING_OPTIONS,
  HAS_PETS_OPTIONS,
  INTEREST_OPTIONS,
  LIFESTYLE_TIDINESS_OPTIONS,
  PET_ATTITUDE_OPTIONS,
  SLEEP_SCHEDULE_OPTIONS,
  SMOKING_OPTIONS,
} from "@/constants/profile-options";
import { updateLifestyle } from "@/api/profile";
import { useProfileStore } from "@/store/profile";
import { useUserStore } from "@/store/user";
import { ensureProfileStep, showProfileError } from "@/utils/profile-flow";

const userStore = useUserStore();
const profileStore = useProfileStore();
const ready = ref(false);
const submitting = ref(false);
const sleepSchedule = ref("");
const atmospherePreference = ref("");
const drinking = ref("");
const smoking = ref("");
const hasPets = ref("");
const petAttitude = ref("");
const lifestyleTidiness = ref("");
const interests = ref<string[]>([]);

onLoad(async () => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: "/pages/login/index" });
    return;
  }
  try {
    const allowed = await ensureProfileStep("lifestyle");
    if (!allowed) return;
    const profile = profileStore.profile;
    if (!profile) return;
    sleepSchedule.value = profile.sleepSchedule ?? "";
    atmospherePreference.value = profile.atmospherePreference ?? "";
    drinking.value = profile.drinking ?? "";
    smoking.value = profile.smoking ?? "";
    hasPets.value = profile.hasPets ?? "";
    petAttitude.value = profile.petAttitude ?? "";
    lifestyleTidiness.value = profile.lifestyleTidiness ?? "";
    interests.value = [...profile.interests];
    ready.value = true;
  } catch (error) {
    showProfileError(error, "资料加载失败");
  }
});

function missing(): string | null {
  if (!sleepSchedule.value) return "请选择作息";
  if (!atmospherePreference.value) return "请选择喜欢的氛围";
  if (!drinking.value) return "请选择饮酒习惯";
  if (!smoking.value) return "请选择吸烟习惯";
  if (!hasPets.value) return "请选择宠物情况";
  if (!petAttitude.value) return "请选择对宠物的态度";
  if (!lifestyleTidiness.value) return "请选择生活状态";
  if (interests.value.length === 0) return "请至少选择一项兴趣爱好";
  return null;
}

async function onSubmit() {
  if (submitting.value) return;
  const message = missing();
  if (message) {
    uni.showToast({ title: message, icon: "none" });
    return;
  }
  submitting.value = true;
  try {
    await updateLifestyle({
      sleepSchedule: sleepSchedule.value,
      atmospherePreference: atmospherePreference.value,
      drinking: drinking.value,
      smoking: smoking.value,
      hasPets: hasPets.value,
      petAttitude: petAttitude.value,
      lifestyleTidiness: lifestyleTidiness.value,
      interests: interests.value,
    });
    uni.navigateTo({ url: "/pages/profile/preferences" });
  } catch (error) {
    showProfileError(error, "保存失败，请稍后再试");
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss">
@import "../../styles/profile-card.scss";
</style>
