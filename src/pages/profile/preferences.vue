<template>
  <profile-scaffold
    v-if="ready"
    title="个人资料"
    :step="3"
    button-text="下一步"
    :submitting="submitting"
    @submit="onSubmit"
  >
    <view class="card">
      <view class="card__head">
        <view class="card__bar"></view>
        <text class="card__title">我的生活偏好</text>
      </view>
      <option-chips v-model="homeTypes" label="我喜欢的家" :options="HOME_TYPE_OPTIONS" multiple />
      <option-chips
        v-model="spaceFeatures"
        label="我喜欢的空间"
        :options="SPACE_FEATURE_OPTIONS"
        multiple
      />
      <option-chips
        v-model="livingNeeds"
        label="我的居住需求"
        :options="LIVING_NEED_OPTIONS"
        multiple
      />
    </view>
  </profile-scaffold>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import OptionChips from "@/components/profile/option-chips.vue";
import ProfileScaffold from "@/components/profile/profile-scaffold.vue";
import {
  HOME_TYPE_OPTIONS,
  LIVING_NEED_OPTIONS,
  SPACE_FEATURE_OPTIONS,
  expandHomeTypes,
} from "@/constants/profile-options";
import { useProfileStore } from "@/store/profile";
import { useUserStore } from "@/store/user";
import { ensureProfileStep, showProfileError } from "@/utils/profile-flow";

const userStore = useUserStore();
const profileStore = useProfileStore();
const ready = ref(false);
const submitting = ref(false);
const homeTypes = ref<string[]>([]);
const spaceFeatures = ref<string[]>([]);
const livingNeeds = ref<string[]>([]);

onLoad(async () => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: "/pages/login/index" });
    return;
  }
  try {
    const allowed = await ensureProfileStep("preferences");
    if (!allowed) return;
    const draft = profileStore.stayDraft;
    const profile = profileStore.profile;
    homeTypes.value = expandHomeTypes(draft?.homeTypes ?? profile?.homeTypes ?? []);
    spaceFeatures.value = [...(draft?.spaceFeatures ?? profile?.spaceFeatures ?? [])];
    livingNeeds.value = [...(draft?.livingNeeds ?? profile?.livingNeeds ?? [])];
    ready.value = true;
  } catch (error) {
    showProfileError(error, "资料加载失败");
  }
});

function missing(): string | null {
  if (homeTypes.value.length === 0) return "请选择喜欢的家";
  if (spaceFeatures.value.length === 0) return "请选择喜欢的空间";
  if (livingNeeds.value.length === 0) return "请选择居住需求";
  return null;
}

function onSubmit() {
  if (submitting.value) return;
  const message = missing();
  if (message) {
    uni.showToast({ title: message, icon: "none" });
    return;
  }
  profileStore.setStayDraft({
    homeTypes: homeTypes.value,
    spaceFeatures: spaceFeatures.value,
    livingNeeds: livingNeeds.value,
  });
  uni.navigateTo({ url: "/pages/profile/travel" });
}
</script>

<style lang="scss">
@import "../../styles/profile-card.scss";
</style>
