<template>
  <view class="content">
    <view class="text-area">
      <text class="title">{{ title }}</text>
      <text class="subtitle">项目初始化完成，开始按 OpenSpec Change 开发吧</text>
    </view>

    <!--
      小程序默认进入首页，首页自行判断登录态（不做自动跳转登录页）：
      未登录展示「去登录」入口按钮，登录后展示账号信息（见 design.md Uniapp
      小节 Decisions：首页为真正的小程序启动页，登录页仅在用户主动触发时进入）。
    -->
    <button v-if="!userStore.isLoggedIn" class="login-entry" @tap="goToLogin">去登录</button>

    <!--
      以下账号信息展示区是本次 add-customer-phone-login 联调验证用的临时内容，
      不代表最终首页设计（见 design.md Uniapp 小节任务 2.7）。
    -->
    <view v-else class="account-card">
      <text class="account-card__label">当前登录账号</text>
      <text class="account-card__phone">
        {{ userStore.account?.countryCode }} {{ userStore.account?.phoneNumber }}
      </text>
      <button class="account-card__logout" @tap="onLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/store/user";

const title = ref("房屋互换");
const userStore = useUserStore();

function goToLogin() {
  uni.reLaunch({ url: "/pages/login/index" });
}

function onLogout() {
  userStore.logout();
}
</script>

<style lang="scss">
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.text-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 26rpx;
  color: #8f8f94;
}

.account-card {
  margin-top: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 48rpx;
  border-radius: 16rpx;
  background-color: #f8f8f8;
}

.account-card__label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.account-card__phone {
  font-size: 30rpx;
  color: #1a1a1a;
  margin-bottom: 24rpx;
}

.account-card__logout {
  font-size: 26rpx;
  color: #1a1a1a;
  background-color: #fff;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 32rpx;
  line-height: 64rpx;
  height: 64rpx;
}

.account-card__logout::after {
  border: none;
}

.login-entry {
  margin-top: 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 64rpx;
  border-radius: 40rpx;
  background-color: #1a1a1a;
  color: #fff;
  font-size: 28rpx;
  border: none;
}

.login-entry::after {
  border: none;
}
</style>
