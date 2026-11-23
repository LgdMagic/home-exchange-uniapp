<template>
  <view class="profile">
    <view class="profile__nav" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="profile__back" @tap="goBack">
        <text class="profile__back-icon">‹</text>
      </view>
      <text class="profile__title">{{ title }}</text>
    </view>

    <scroll-view scroll-y class="profile__scroll">
      <view v-if="step" class="profile__progress">
        <view class="profile__track">
          <view class="profile__fill" :style="{ width: `${(step / 4) * 100}%` }"></view>
        </view>
        <text class="profile__step">{{ stepText }}</text>
      </view>
      <slot />
      <view v-if="!hideButton" class="profile__action">
        <button class="profile__submit" @tap="onSubmit">{{ buttonText }}</button>
        <text v-if="hint" class="profile__hint">{{ hint }}</text>
      </view>
      <view class="profile__safe" :style="{ height: `${safeBottom}px` }"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const props = defineProps<{
  title: string;
  buttonText: string;
  step?: 1 | 2 | 3 | 4;
  hint?: string;
  submitting?: boolean;
  hideButton?: boolean;
}>();

const emit = defineEmits<{
  submit: [];
}>();

const statusBarHeight = ref(20);
const safeBottom = ref(0);
const stepText = computed(
  () => ["", "第一步/共四步", "第二步/共四步", "第三步/共四步", "第四步/共四步"][props.step ?? 0]
);

onMounted(() => {
  const info = uni.getSystemInfoSync();
  statusBarHeight.value = info.statusBarHeight || 20;
  const inset = info.safeAreaInsets?.bottom;
  if (typeof inset === "number") {
    safeBottom.value = inset;
    return;
  }
  if (info.safeArea && info.screenHeight) {
    safeBottom.value = Math.max(info.screenHeight - info.safeArea.bottom, 0);
  }
});

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: "/pages/mine/index" });
    },
  });
}

function onSubmit() {
  if (props.submitting) return;
  emit("submit");
}
</script>

<style lang="scss">
.profile {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f6f2;
}

.profile__nav {
  height: 88rpx;
  box-sizing: content-box;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #f8f6f2;
}

.profile__back {
  position: absolute;
  left: 24rpx;
  bottom: 12rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile__back-icon {
  font-size: 48rpx;
  line-height: 1;
  color: #232423;
}

.profile__title {
  font-size: 40rpx;
  color: #232423;
}

.profile__scroll {
  flex: 1;
  height: 0;
}

.profile__progress {
  margin: 32rpx 39rpx 24rpx;
}

.profile__track {
  height: 13rpx;
  border: 1rpx solid #808080;
  border-radius: 7rpx;
  overflow: hidden;
  box-sizing: border-box;
}

.profile__fill {
  height: 100%;
  background-color: #808080;
}

.profile__step {
  display: block;
  margin-top: 12rpx;
  text-align: center;
  font-size: 22rpx;
  color: #808080;
}

.profile__action {
  margin: 48rpx 63rpx 32rpx;
}

.profile__safe {
  width: 100%;
  flex-shrink: 0;
}

.profile__submit {
  width: 100%;
  height: 104rpx;
  line-height: 104rpx;
  margin: 0;
  padding: 0;
  border-radius: 78px;
  overflow: hidden;
  background-color: #232423;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 400;
  border: none;
  box-sizing: border-box;
}

.profile__submit::after {
  border: none;
  border-radius: 78px;
}

.profile__hint {
  display: block;
  margin-top: 20rpx;
  text-align: center;
  font-size: 22rpx;
  color: #808080;
}
</style>
