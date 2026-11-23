<template>
  <profile-scaffold
    v-if="ready"
    title="个人资料"
    :step="4"
    button-text="下一步 · 预览我的资料"
    :submitting="submitting"
    @submit="onSubmit"
  >
    <view class="card">
      <view class="card__head">
        <view class="card__bar"></view>
        <text class="card__title">我的旅行方式</text>
      </view>
      <option-chips
        v-model="travelCompanions"
        label="我通常怎样旅行"
        :options="TRAVEL_COMPANION_OPTIONS"
        multiple
      />
      <option-chips
        v-model="travelStyles"
        label="我喜欢怎样旅行"
        :options="TRAVEL_STYLE_OPTIONS"
        multiple
      />
      <option-chips
        v-model="cityExplorationStyles"
        label="我喜欢怎样认识一座城市"
        :options="CITY_EXPLORATION_OPTIONS"
        :columns="2"
        multiple
      />
      <option-chips
        v-model="travelFrequency"
        label="我的旅行频率"
        :options="TRAVEL_FREQUENCY_OPTIONS"
      />
      <option-chips v-model="languages" label="我的语言" :options="LANGUAGE_OPTIONS" multiple />
    </view>
  </profile-scaffold>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import OptionChips from "@/components/profile/option-chips.vue";
import ProfileScaffold from "@/components/profile/profile-scaffold.vue";
import {
  CITY_EXPLORATION_OPTIONS,
  LANGUAGE_OPTIONS,
  TRAVEL_COMPANION_OPTIONS,
  TRAVEL_FREQUENCY_OPTIONS,
  TRAVEL_STYLE_OPTIONS,
  expandHomeTypes,
} from "@/constants/profile-options";
import { updateAccommodationTravel } from "@/api/profile";
import { useProfileStore } from "@/store/profile";
import { useUserStore } from "@/store/user";
import { ensureProfileStep, showProfileError } from "@/utils/profile-flow";

const userStore = useUserStore();
const profileStore = useProfileStore();
const ready = ref(false);
const submitting = ref(false);
const travelCompanions = ref<string[]>([]);
const travelStyles = ref<string[]>([]);
const cityExplorationStyles = ref<string[]>([]);
const travelFrequency = ref("");
const languages = ref<string[]>([]);

onLoad(async () => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: "/pages/login/index" });
    return;
  }
  try {
    const allowed = await ensureProfileStep("travel");
    if (!allowed) return;
    const profile = profileStore.profile;
    if (!profile) return;
    travelCompanions.value = [...profile.travelCompanions];
    travelStyles.value = [...profile.travelStyles];
    cityExplorationStyles.value = [...profile.cityExplorationStyles];
    travelFrequency.value = profile.travelFrequency ?? "";
    languages.value = [...profile.languages];
    ready.value = true;
  } catch (error) {
    showProfileError(error, "资料加载失败");
  }
});

function missing(): string | null {
  if (travelCompanions.value.length === 0) return "请选择通常怎样旅行";
  if (travelStyles.value.length === 0) return "请选择喜欢的旅行方式";
  if (cityExplorationStyles.value.length === 0) return "请选择认识城市的方式";
  if (!travelFrequency.value) return "请选择旅行频率";
  if (languages.value.length === 0) return "请至少选择一种语言";
  return null;
}

async function onSubmit() {
  if (submitting.value) return;
  const message = missing();
  if (message) {
    uni.showToast({ title: message, icon: "none" });
    return;
  }
  const stay = profileStore.stayDraft ?? {
    homeTypes: expandHomeTypes(profileStore.profile?.homeTypes ?? []),
    spaceFeatures: profileStore.profile?.spaceFeatures ?? [],
    livingNeeds: profileStore.profile?.livingNeeds ?? [],
  };
  if (stay.homeTypes.length === 0 || stay.spaceFeatures.length === 0 || stay.livingNeeds.length === 0) {
    uni.showToast({ title: "请先完成生活偏好", icon: "none" });
    uni.redirectTo({ url: "/pages/profile/preferences" });
    return;
  }
  submitting.value = true;
  try {
    await updateAccommodationTravel({
      homeTypes: stay.homeTypes,
      spaceFeatures: stay.spaceFeatures,
      livingNeeds: stay.livingNeeds,
      travelCompanions: travelCompanions.value,
      travelStyles: travelStyles.value,
      cityExplorationStyles: cityExplorationStyles.value,
      travelFrequency: travelFrequency.value,
      languages: languages.value,
    });
    uni.navigateTo({ url: "/pages/profile/preview" });
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
