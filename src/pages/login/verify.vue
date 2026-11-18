<template>
  <view class="verify-page">
    <!--
      本页按 MasterGo 设计稿「3 短信验证」(layer 3:1394) 1:1 还原，换算规则同登录页：
      画布 1125×2436px，rpx = designPx × 2/3。设计稿顶部的状态栏（9:41 等）同样属于
      MasterGo 模板自带的设备外壳装饰，不予还原（见 login/index.vue 顶部注释）。
    -->
    <view class="verify-page__header-band"></view>

    <text class="verify-page__nav-title">短信验证</text>

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

    <text class="verify-page__hint">请输入6位验证码</text>

    <view
      class="verify-page__resend"
      :class="{ 'verify-page__resend--disabled': countdown > 0 }"
      @tap="onResend"
    >
      <text class="verify-page__resend-text">
        {{ countdown > 0 ? `${countdown}s 后重新获取` : "重新获取" }}
      </text>
    </view>

    <text class="verify-page__notice-title">为什么需要短信验证？</text>
    <text class="verify-page__notice-body">
      用于确认手机号真实有效，保障后续看房、预定与签约通知能及时送达
    </text>

    <button class="verify-page__submit" :disabled="!canSubmit || submitting" @tap="onSubmit">
      {{ submitting ? "验证中..." : "确认并继续" }}
    </button>

    <text class="verify-page__submit-helper">验证成功后进入身份证信息填写</text>
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
</script>

<style lang="scss">
/* 画布基准：750rpx（design 1125px，比例 rpx = designPx × 2/3） */
.verify-page {
  position: relative;
  width: 750rpx;
  min-height: 100vh;
  overflow: hidden;
  background-color: #f5f5f7;
  box-sizing: border-box;
  padding-bottom: env(safe-area-inset-bottom);
}

.verify-page__header-band {
  position: absolute;
  left: 0;
  top: 0;
  width: 750rpx;
  height: 213.33rpx;
  background-color: #ffffff;
}

.verify-page__nav-title {
  position: absolute;
  left: 295rpx;
  top: 118.5rpx;
  width: 160rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  font-size: 40rpx;
  color: #000000;
}

.verify-page__subtitle {
  position: absolute;
  left: 159.33rpx;
  top: 299.69rpx;
  width: 431.33rpx;
  height: 33.33rpx;
  line-height: 33.33rpx;
  text-align: center;
  font-size: 33.33rpx;
  color: #333333;
}

.verify-page__code-wrap {
  position: absolute;
  left: 38.67rpx;
  top: 371.09rpx;
  width: 672.67rpx;
  height: 95.81rpx;
}

.verify-page__code-box {
  position: absolute;
  top: 0;
  width: 95.81rpx;
  height: 95.81rpx;
  border: 2.67rpx solid #808080;
  border-radius: 19.78rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #1a1a1a;
}

.verify-page__code-box:nth-child(1) {
  left: 0;
}
.verify-page__code-box:nth-child(2) {
  left: 115.37rpx;
}
.verify-page__code-box:nth-child(3) {
  left: 230.74rpx;
}
.verify-page__code-box:nth-child(4) {
  left: 346.11rpx;
}
.verify-page__code-box:nth-child(5) {
  left: 461.48rpx;
}
.verify-page__code-box:nth-child(6) {
  left: 576.85rpx;
}

.verify-page__code-box--active {
  border-color: #1a1a1a;
}

.verify-page__code-input {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.verify-page__hint {
  position: absolute;
  left: 38.67rpx;
  top: 518.17rpx;
  width: 141.33rpx;
  height: 18.67rpx;
  line-height: 18.67rpx;
  font-size: 18.67rpx;
  font-weight: 300;
  color: #808080;
}

.verify-page__resend {
  position: absolute;
  left: 509.13rpx;
  top: 502rpx;
  width: 202.2rpx;
  height: 49.69rpx;
  border: 0.67rpx solid #cccccc;
  border-radius: 24.85rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-page__resend-text {
  font-size: 18.67rpx;
  font-weight: 300;
  color: #808080;
}

.verify-page__resend--disabled {
  opacity: 0.6;
}

.verify-page__notice-title {
  position: absolute;
  left: 38.67rpx;
  top: 585.08rpx;
  width: 266.67rpx;
  height: 26.67rpx;
  line-height: 26.67rpx;
  font-size: 26.67rpx;
  color: #0a4db6;
}

.verify-page__notice-body {
  position: absolute;
  left: 38.67rpx;
  top: 627.2rpx;
  width: 578.67rpx;
  height: 18.67rpx;
  line-height: 18.67rpx;
  font-size: 18.67rpx;
  font-weight: 300;
  color: #808080;
}

.verify-page__submit {
  position: absolute;
  left: 43.15rpx;
  top: 779.35rpx;
  width: 672.67rpx;
  height: 104rpx;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13.33rpx;
  background-color: #232423;
  color: #ffffff;
  font-size: 40rpx;
  line-height: 1;
  border: none;
}

.verify-page__submit::after {
  border: none;
}

.verify-page__submit[disabled] {
  background-color: #c0c0c0;
  color: #ffffff;
  opacity: 1;
}

.verify-page__submit-helper {
  position: absolute;
  left: 220.81rpx;
  top: 915.11rpx;
  width: 317.33rpx;
  height: 22.67rpx;
  line-height: 22.67rpx;
  text-align: center;
  font-size: 22.67rpx;
  color: #808080;
}
</style>
