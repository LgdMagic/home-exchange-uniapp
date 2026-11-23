<template>
  <view class="living">
    <view class="living__nav" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="living__back" @tap="goBack">
        <text class="living__back-icon">‹</text>
      </view>
    </view>

    <scroll-view scroll-y class="living__scroll">
      <view class="living__body">
        <text class="living__eyebrow">FIRST LIVING EXCHANGE</text>
        <text class="living__title">这是你的第一次</text>
        <text class="living__title">生活交换</text>
        <text class="living__lead">你还没有 Living Days</text>
        <text class="living__lead">但我们愿意先给你一次机会</text>

        <view class="living__hero">
          <text class="living__upto">UO TO</text>
          <text class="living__days">2 Days</text>
          <text class="living__hero-note">首次交换权益·可选1或2天</text>
        </view>

        <view class="living__card">
          <view v-for="(item, index) in conditions" :key="item.title" class="living__row">
            <view v-if="index > 0" class="living__line"></view>
            <view class="living__row-main">
              <view class="living__mark">
                <text class="living__check">✓</text>
              </view>
              <view class="living__copy">
                <text class="living__row-title">{{ item.title }}</text>
                <text class="living__row-desc">{{ item.desc }}</text>
              </view>
              <view class="living__pill">
                <text class="living__pill-text">已完成</text>
              </view>
            </view>
          </view>
        </view>

        <button class="living__submit" @tap="goExchange">开始第一次生活交换</button>
        <text class="living__hint">选择心仪的房源，用首次权益免费住进别人的生活</text>

        <view class="living__card living__about">
          <text class="living__about-title">什么是 Living Days？</text>
          <text class="living__about-line">· 你的房源被预定 X 天，交换结束后获得 X Living Days</text>
          <text class="living__about-line">· 天数是唯一的交换媒介，无法充值购买</text>
          <text class="living__about-line">· 首次交换权益一次性使用，用完不存入余额</text>
        </view>

        <view class="living__safe" :style="{ height: `${safeBottom}px` }"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const statusBarHeight = ref(20);
const safeBottom = ref(0);

const conditions = [
  { title: "实名认证", desc: "身份证信息已核验" },
  { title: "手机认证", desc: "+86 138****5678" },
  { title: "个人资料", desc: "资料完成度100%" },
];

onLoad(() => {
  const info = uni.getSystemInfoSync();
  statusBarHeight.value = info.statusBarHeight || 20;
  const inset = info.safeAreaInsets?.bottom;
  if (typeof inset === "number") {
    safeBottom.value = inset;
  } else if (info.safeArea && info.screenHeight) {
    safeBottom.value = Math.max(info.screenHeight - info.safeArea.bottom, 0);
  }

  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: "/pages/login/index" });
  }
});

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: "/pages/index/index" });
    },
  });
}

function goExchange() {
  uni.switchTab({ url: "/pages/exchange/index" });
}
</script>

<style lang="scss">
.living {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f6f2;
}

.living__nav {
  height: 88rpx;
  box-sizing: content-box;
  position: relative;
}

.living__back {
  position: absolute;
  left: 24rpx;
  bottom: 12rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.living__back-icon {
  font-size: 48rpx;
  line-height: 1;
  color: #232423;
}

.living__scroll {
  flex: 1;
  height: 0;
}

.living__body {
  padding: 24rpx 22rpx 32rpx;
}

.living__eyebrow {
  display: block;
  text-align: center;
  font-size: 21rpx;
  font-weight: 900;
  letter-spacing: 0.135em;
  color: #232423;
}

.living__title {
  display: block;
  text-align: center;
  font-size: 64rpx;
  font-weight: 600;
  line-height: 1.15;
  color: #232423;
}

.living__title:first-of-type {
  margin-top: 28rpx;
}

.living__lead {
  display: block;
  text-align: center;
  font-size: 26rpx;
  line-height: 1.4;
  color: #666666;
}

.living__lead:first-of-type {
  margin-top: 48rpx;
}

.living__hero {
  margin-top: 40rpx;
  height: 347rpx;
  border-radius: 13rpx;
  background-color: #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.living__upto {
  font-size: 33rpx;
  font-weight: 900;
  letter-spacing: 0.135em;
  color: #999999;
}

.living__days {
  margin-top: 16rpx;
  font-size: 80rpx;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #ffffff;
}

.living__hero-note {
  margin-top: 28rpx;
  font-size: 31rpx;
  letter-spacing: 0.045em;
  color: #e6e6e6;
}

.living__card {
  margin-top: 20rpx;
  padding: 28rpx 24rpx;
  border-radius: 13rpx;
  background-color: #ffffff;
}

.living__row-main {
  display: flex;
  align-items: center;
  padding: 22rpx 0;
}

.living__line {
  height: 1rpx;
  background-color: #cccccc;
}

.living__mark {
  width: 53rpx;
  height: 53rpx;
  border-radius: 27rpx;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.living__check {
  font-size: 26rpx;
  line-height: 1;
  color: #232423;
}

.living__copy {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.living__row-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #333333;
}

.living__row-desc {
  margin-top: 8rpx;
  font-size: 17rpx;
  color: #666666;
}

.living__pill {
  height: 45rpx;
  padding: 0 28rpx;
  border-radius: 23rpx;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.living__pill-text {
  font-size: 23rpx;
  font-weight: 700;
  color: #666666;
}

.living__submit {
  margin-top: 28rpx;
  height: 104rpx;
  line-height: 104rpx;
  border-radius: 78px;
  overflow: hidden;
  background-color: #232423;
  color: #ffffff;
  font-size: 40rpx;
  border: none;
}

.living__submit::after {
  border: none;
  border-radius: 78px;
}

.living__hint {
  display: block;
  margin-top: 20rpx;
  text-align: center;
  font-size: 21rpx;
  color: #666666;
}

.living__about {
  margin-top: 36rpx;
}

.living__about-title {
  display: block;
  font-size: 29rpx;
  font-weight: 700;
  color: #232423;
}

.living__about-line {
  display: block;
  margin-top: 16rpx;
  font-size: 23rpx;
  line-height: 1.5;
  color: #232423;
}

.living__safe {
  width: 100%;
}
</style>
