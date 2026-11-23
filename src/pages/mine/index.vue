<template>
  <view class="page">
    <button v-if="!userStore.isLoggedIn" class="entry" @tap="goLogin">去登录</button>
    <text v-else-if="loading" class="hint">加载中...</text>
    <text v-else-if="completed" class="hint">个人资料已完成</text>
    <button v-else class="entry" @tap="continueProfile">完善个人资料</button>
    <text v-if="errorText" class="error" @tap="refresh">{{ errorText }}，点击重试</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useProfileStore } from "@/store/profile";
import { useUserStore } from "@/store/user";
import { REAL_NAME_PATH, isRealNameSubmitted, showProfileError } from "@/utils/profile-flow";

const userStore = useUserStore();
const profileStore = useProfileStore();
const loading = ref(false);
const completed = ref(false);
const errorText = ref("");

onShow(() => {
  void refresh();
});

async function refresh() {
  errorText.value = "";
  completed.value = false;
  if (!userStore.isLoggedIn) return;
  loading.value = true;
  try {
    const profile = await profileStore.load();
    completed.value = Boolean(profile.profileCompletedAt);
  } catch (error) {
    errorText.value = "资料状态加载失败";
    showProfileError(error, "资料状态加载失败");
  } finally {
    loading.value = false;
  }
}

function goLogin() {
  uni.reLaunch({ url: "/pages/login/index" });
}

function continueProfile() {
  const profile = profileStore.profile;
  if (!profile) return;
  const url = isRealNameSubmitted(profile) ? "/pages/profile/basic" : REAL_NAME_PATH;
  uni.navigateTo({ url });
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f7;
}

.entry {
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 64rpx;
  border-radius: 40rpx;
  background-color: #232423;
  color: #ffffff;
  font-size: 28rpx;
  border: none;
}

.entry::after {
  border: none;
}

.hint,
.error {
  font-size: 28rpx;
  color: #666666;
}

.error {
  margin-top: 24rpx;
  color: #808080;
}
</style>
