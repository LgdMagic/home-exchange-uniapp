<template>
  <view class="page">
    <template v-if="!userStore.isLoggedIn">
      <text class="hint">登录后才能发起或参与生活交换</text>
      <button class="entry" @tap="goLogin">去登录</button>
    </template>
    <template v-else-if="loading">
      <text class="hint">加载中...</text>
    </template>
    <template v-else-if="errorText">
      <text class="hint" @tap="refresh">{{ errorText }}，点击重试</text>
    </template>
    <template v-else-if="!completed">
      <text class="hint">完成个人资料后，才能发起或参与生活交换</text>
      <button class="entry" @tap="continueProfile">去完善资料</button>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useProfileStore } from "@/store/profile";
import { useUserStore } from "@/store/user";
import { setupEntryPath, showProfileError } from "@/utils/profile-flow";

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
  const url = setupEntryPath(profile);
  if (!url) return;
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
  padding: 0 48rpx;
  background-color: #ffffff;
}

.hint {
  font-size: 28rpx;
  line-height: 1.6;
  color: #666666;
  text-align: center;
}

.entry {
  margin-top: 40rpx;
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
</style>
