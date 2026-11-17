<template>
  <view class="content">
    <view class="text-area">
      <text class="title">{{ title }}</text>
      <text class="subtitle">项目初始化完成，开始按 OpenSpec Change 开发吧</text>
    </view>

    <!--
      以下账号信息展示区是本次 add-customer-phone-login 联调验证用的临时内容，
      不代表最终首页设计（见 design.md Uniapp 小节任务 2.7）。
    -->
    <view v-if="userStore.isLoggedIn" class="account-card">
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

function onLogout() {
  userStore.logout();
  uni.reLaunch({ url: "/pages/login/index" });
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
  color: #4b5563;
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
</style>
