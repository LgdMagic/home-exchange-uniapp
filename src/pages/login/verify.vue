<template>
  <view class="verify-page">
    <view class="verify-page__nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="verify-page__back" @tap="goBack">
        <text class="verify-page__back-icon">‹</text>
      </view>
      <text class="verify-page__nav-title">短信验证</text>
    </view>

    <view class="verify-page__content">
      <text class="verify-page__title">短信验证</text>
      <text class="verify-page__subtitle">验证码已发送至 {{ maskedPhone }}</text>

      <!--
        自绘 6 位验证码输入框：隐形 input 叠加在 6 个视觉方块上方（见 design.md Uniapp
        小节 Decisions 第 7 条，小程序无原生分格输入框）。
      -->
      <view class="verify-page__code-wrap" @tap="focusInput">
        <view
          v-for="(digit, index) in codeDigits"
          :key="index"
          class="verify-page__code-box"
          :class="{ 'verify-page__code-box--active': index === code.length }"
        >
          <text>{{ digit }}</text>
        </view>
        <input
          v-model="code"
          class="verify-page__code-input"
          type="number"
          :maxlength="6"
          :focus="inputFocused"
          @blur="inputFocused = false"
        />
      </view>

      <view class="verify-page__resend-row">
        <text class="verify-page__hint">请输入 6 位验证码</text>
        <text
          class="verify-page__resend"
          :class="{ 'verify-page__resend--disabled': countdown > 0 }"
          @tap="onResend"
        >
          {{ countdown > 0 ? `${countdown}s 后重新获取` : "重新获取" }}
        </text>
      </view>

      <view class="verify-page__notice">
        <text class="verify-page__notice-title">为什么需要短信验证？</text>
        <text class="verify-page__notice-body">
          用于确认手机号真实有效，保障后续看房、预定与签约通知能及时送达
        </text>
      </view>

      <button class="verify-page__submit" :disabled="!canSubmit || submitting" @tap="onSubmit">
        {{ submitting ? "验证中..." : "确认并继续" }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { loginWithSms, sendSmsCode, AUTH_ERROR_MESSAGE } from "@/api/auth";
import { BusinessError } from "@/utils/request";
import { useLoginFlowStore } from "@/store/login-flow";
import { useUserStore } from "@/store/user";

const loginFlow = useLoginFlowStore();
const userStore = useUserStore();

const statusBarHeight = ref(20);
const code = ref("");
const inputFocused = ref(true);
const submitting = ref(false);
const countdown = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;

const codeDigits = computed(() => Array.from({ length: 6 }, (_, i) => code.value[i] ?? ""));
const canSubmit = computed(() => code.value.length === 6);

const maskedPhone = computed(() => {
  const { countryCode, phoneNumber } = loginFlow;
  if (phoneNumber.length <= 4) {
    return `${countryCode} ${phoneNumber}`;
  }
  const visibleTail = phoneNumber.slice(-4);
  return `${countryCode} ${"*".repeat(phoneNumber.length - 4)}${visibleTail}`;
});

onLoad(() => {
  const info = uni.getSystemInfoSync();
  statusBarHeight.value = info.statusBarHeight ?? 20;

  if (!loginFlow.phoneNumber) {
    // 理论上不会在没有先发送验证码的情况下进入这个页面，双重保险
    uni.showToast({ title: "请先获取验证码", icon: "none" });
    uni.navigateBack();
    return;
  }

  startCountdown(loginFlow.cooldownSeconds);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

function startCountdown(seconds: number) {
  countdown.value = seconds;
  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  }, 1000);
}

function focusInput() {
  inputFocused.value = true;
}

async function onResend() {
  if (countdown.value > 0) {
    return;
  }

  try {
    const result = await sendSmsCode({
      countryCode: loginFlow.countryCode,
      phoneNumber: loginFlow.phoneNumber,
    });
    loginFlow.setCooldownSeconds(result.cooldownSeconds);
    startCountdown(result.cooldownSeconds);
    code.value = "";
    uni.showToast({ title: "验证码已重新发送", icon: "none" });
  } catch (error) {
    const message =
      error instanceof BusinessError
        ? (AUTH_ERROR_MESSAGE[error.code] ?? error.message)
        : "发送失败，请稍后再试";
    uni.showToast({ title: message, icon: "none" });
  }
}

async function onSubmit() {
  if (!canSubmit.value || submitting.value) {
    return;
  }

  submitting.value = true;
  try {
    const result = await loginWithSms({
      countryCode: loginFlow.countryCode,
      phoneNumber: loginFlow.phoneNumber,
      code: code.value,
      agreedToTerms: true,
    });
    userStore.login(result);
    loginFlow.reset();
    // 新用户/老用户均直接进入首页，不强制补全资料（见 spec.md「新用户登录后无需强制完善资料」）
    uni.reLaunch({ url: "/pages/index/index" });
  } catch (error) {
    const message =
      error instanceof BusinessError
        ? (AUTH_ERROR_MESSAGE[error.code] ?? error.message)
        : "验证失败，请稍后再试";
    uni.showToast({ title: message, icon: "none" });
    if (error instanceof BusinessError && (error.code === 20004 || error.code === 20006)) {
      // 验证码过期 / 连续输错失效：清空已输入内容，提示用户重新获取
      code.value = "";
    }
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  uni.navigateBack();
}
</script>

<style lang="scss">
.verify-page {
  min-height: 100vh;
  background-color: #fff;
}

.verify-page__nav {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  box-sizing: border-box;
  position: relative;
}

.verify-page__back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-page__back-icon {
  font-size: 48rpx;
  color: #333;
}

.verify-page__nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32rpx;
  color: #1a1a1a;
}

.verify-page__content {
  padding: 40rpx 60rpx 0;
  display: flex;
  flex-direction: column;
}

.verify-page__title {
  font-size: 40rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.verify-page__subtitle {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 48rpx;
}

.verify-page__code-wrap {
  position: relative;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.verify-page__code-box {
  width: 90rpx;
  height: 100rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #1a1a1a;
}

.verify-page__code-box--active {
  border-color: #4b5563;
}

.verify-page__code-input {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100rpx;
  opacity: 0;
}

.verify-page__resend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 56rpx;
}

.verify-page__hint {
  font-size: 24rpx;
  color: #999;
}

.verify-page__resend {
  font-size: 24rpx;
  color: #4b5563;
}

.verify-page__resend--disabled {
  color: #c0c0c0;
}

.verify-page__notice {
  background-color: #f8f8f8;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  margin-bottom: 56rpx;
}

.verify-page__notice-title {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.verify-page__notice-body {
  font-size: 22rpx;
  color: #999;
  line-height: 1.6;
}

.verify-page__submit {
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 16rpx;
  background-color: #4b5563;
  color: #fff;
  font-size: 30rpx;
  border: none;
}

.verify-page__submit::after {
  border: none;
}

.verify-page__submit[disabled] {
  background-color: #c0c0c0;
  color: #fff;
  opacity: 1;
}
</style>
