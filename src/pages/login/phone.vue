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
          <text class="phone-page__field-text">{{ countryCode }} {{ regionLabel }}</text>
          <text class="phone-page__arrow">›</text>
        </view>
      </picker>

      <view class="phone-page__field">
        <input
          v-model="phoneNumber"
          class="phone-page__input"
          type="number"
          placeholder="请输入手机号"
          placeholder-class="phone-page__placeholder"
          :maxlength="15"
        />
      </view>
    </view>

    <view class="phone-page__action" :style="{ paddingBottom: `${safeBottom}px` }">
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
const safeBottom = ref(0);
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
  const inset = info.safeAreaInsets?.bottom;
  if (typeof inset === "number") {
    safeBottom.value = inset;
  } else if (info.safeArea && info.screenHeight) {
    safeBottom.value = Math.max(info.screenHeight - info.safeArea.bottom, 0);
  }

  if (!loginFlow.agreedToTerms) {
    // 理论上不会从登录页在未勾选协议时跳转到这里，双重保险
    uni.showToast({ title: "请先同意用户协议和隐私政策", icon: "none" });
    uni.navigateBack();
    return;
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
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f6f2;
}

.phone-page__nav {
  height: 88rpx;
  box-sizing: content-box;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #f8f6f2;
}

.phone-page__back {
  position: absolute;
  left: 24rpx;
  bottom: 12rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-page__back-icon {
  font-size: 48rpx;
  line-height: 1;
  color: #232423;
}

.phone-page__content {
  flex: 1;
  padding: 69rpx 63rpx 0;
  display: flex;
  flex-direction: column;
}

.phone-page__title {
  display: block;
  text-align: center;
  font-size: 53rpx;
  font-weight: 700;
  line-height: 1;
  color: #333333;
}

.phone-page__subtitle {
  display: block;
  margin-top: 19rpx;
  text-align: center;
  font-size: 19rpx;
  line-height: 1;
  color: #808080;
}

.phone-page__field {
  display: flex;
  align-items: center;
  height: 80rpx;
  margin-top: 48rpx;
  border-bottom: 1rpx solid #808080;
}

.phone-page__field--region {
  margin-top: 132rpx;
}

.phone-page__field-text,
.phone-page__input,
.phone-page__placeholder {
  flex: 1;
  font-size: 33rpx;
  letter-spacing: 0.045em;
  color: #cccccc;
}

.phone-page__input {
  height: 80rpx;
  color: #333333;
}

.phone-page__arrow {
  margin-left: 16rpx;
  font-size: 36rpx;
  line-height: 1;
  color: #808080;
}

.phone-page__action {
  padding: 0 63rpx 135rpx;
}

.phone-page__submit {
  width: 100%;
  height: 104rpx;
  line-height: 104rpx;
  padding: 0;
  border-radius: 78px;
  overflow: hidden;
  background-color: #232423;
  color: #ffffff;
  font-size: 40rpx;
  border: none;
}

.phone-page__submit::after {
  border: none;
  border-radius: 78px;
}

.phone-page__submit[disabled] {
  border-radius: 78px;
  background-color: #c0c0c0;
  color: #fff;
  opacity: 1;
}
</style>
