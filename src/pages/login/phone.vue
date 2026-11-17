<template>
  <view class="phone-page">
    <view class="phone-page__nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="phone-page__back" @tap="goBack">
        <text class="phone-page__back-icon">‹</text>
      </view>
    </view>

    <view class="phone-page__content">
      <text class="phone-page__title">手机号登录</text>
      <text class="phone-page__subtitle">未注册的手机号验证后将自动创建账号</text>

      <picker :range="regionLabels" :value="regionIndex" @change="onRegionChange">
        <view class="phone-page__field phone-page__field--region">
          <text class="phone-page__region-code">{{ countryCode }}</text>
          <text class="phone-page__region-label">{{ regionLabel }}</text>
          <text class="phone-page__region-arrow">▾</text>
        </view>
      </picker>

      <view class="phone-page__field">
        <input
          v-model="phoneNumber"
          class="phone-page__input"
          type="number"
          placeholder="请输入手机号"
          :maxlength="15"
        />
      </view>

      <button class="phone-page__submit" :disabled="!canSubmit || sending" @tap="onSendCode">
        {{ sending ? "发送中..." : "获取验证码" }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { sendSmsCode, AUTH_ERROR_MESSAGE } from "@/api/auth";
import { BusinessError } from "@/utils/request";
import { SUPPORTED_REGIONS, findRegionIndex } from "@/constants/regions";
import { useLoginFlowStore } from "@/store/login-flow";

const loginFlow = useLoginFlowStore();

const statusBarHeight = ref(20);
const countryCode = ref(loginFlow.countryCode);
const phoneNumber = ref(loginFlow.phoneNumber);
const sending = ref(false);

const regionLabels = SUPPORTED_REGIONS.map((region) => `${region.countryCode} ${region.label}`);
const regionIndex = computed(() => findRegionIndex(countryCode.value));
const regionLabel = computed(
  () => SUPPORTED_REGIONS.find((r) => r.countryCode === countryCode.value)?.label ?? ""
);

// 简单的前端 UX 校验（非空 + 纯数字 + 合理长度），真正格式/区号校验以后端 20001 错误为准
// （见 design.md Uniapp 小节 Decisions 第 4 条：前端不作为校验权威）。
const canSubmit = computed(() => /^\d{4,15}$/.test(phoneNumber.value));

onLoad(() => {
  const info = uni.getSystemInfoSync();
  statusBarHeight.value = info.statusBarHeight ?? 20;

  if (!loginFlow.agreedToTerms) {
    // 理论上不会从登录页在未勾选协议时跳转到这里，双重保险
    uni.showToast({ title: "请先同意用户协议和隐私政策", icon: "none" });
    uni.navigateBack();
  }
});

function onRegionChange(e: { detail: { value: string } }) {
  const index = Number(e.detail.value);
  const region = SUPPORTED_REGIONS[index];
  if (region) {
    countryCode.value = region.countryCode;
  }
}

async function onSendCode() {
  if (!canSubmit.value || sending.value) {
    return;
  }

  sending.value = true;
  try {
    const result = await sendSmsCode({
      countryCode: countryCode.value,
      phoneNumber: phoneNumber.value,
    });
    loginFlow.setPhone(countryCode.value, phoneNumber.value);
    loginFlow.setCooldownSeconds(result.cooldownSeconds);
    uni.navigateTo({ url: "/pages/login/verify" });
  } catch (error) {
    const message =
      error instanceof BusinessError
        ? (AUTH_ERROR_MESSAGE[error.code] ?? error.message)
        : "发送失败，请稍后再试";
    uni.showToast({ title: message, icon: "none" });
  } finally {
    sending.value = false;
  }
}

function goBack() {
  uni.navigateBack();
}
</script>

<style lang="scss">
.phone-page {
  min-height: 100vh;
  background-color: #fff;
}

.phone-page__nav {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.phone-page__back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-page__back-icon {
  font-size: 48rpx;
  color: #333;
}

.phone-page__content {
  padding: 40rpx 60rpx 0;
  display: flex;
  flex-direction: column;
}

.phone-page__title {
  font-size: 40rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.phone-page__subtitle {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 56rpx;
}

.phone-page__field {
  display: flex;
  align-items: center;
  height: 96rpx;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 8rpx;
  position: relative;
}

.phone-page__region-code {
  font-size: 30rpx;
  color: #1a1a1a;
  margin-right: 12rpx;
}

.phone-page__region-label {
  font-size: 26rpx;
  color: #666;
  flex: 1;
}

.phone-page__region-arrow {
  font-size: 24rpx;
  color: #999;
}

.phone-page__input {
  flex: 1;
  font-size: 30rpx;
  height: 96rpx;
}

.phone-page__submit {
  margin-top: 64rpx;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 16rpx;
  background-color: #1a1a1a;
  color: #fff;
  font-size: 30rpx;
  border: none;
}

.phone-page__submit::after {
  border: none;
}

.phone-page__submit[disabled] {
  background-color: #c0c0c0;
  color: #fff;
  opacity: 1;
}
</style>
