<template>
  <view class="login-page">
    <view class="login-page__top">
      <view class="login-page__avatar">
        <text class="login-page__avatar-emoji">🐱</text>
      </view>
      <text class="login-page__title">自由旅猫</text>
      <text class="login-page__subtitle">住进别人的生活，交换一段旅程</text>
    </view>

    <view class="login-page__bottom">
      <!--
        微信一键登录必须使用 open-type="getPhoneNumber" 的原生按钮触发微信授权弹窗，
        不能用普通按钮 + JS 主动调起、也不能用 disabled 拦截点击（微信规定 disabled 按钮
        完全不响应任何事件，无法借此弹提示，见 design.md Uniapp 小节 Decisions 第 6 条）。
        未勾选协议时，在按钮上方盖一层可点击遮罩拦截点击并提示；勾选后遮罩移除，
        点击才能真正落到按钮上触发微信授权。
      -->
      <view class="login-page__btn-wrap">
        <button
          class="login-page__btn login-page__btn--wechat"
          open-type="getPhoneNumber"
          @getphonenumber="onGetPhoneNumber"
        >
          <text class="login-page__btn-icon">💚</text>
          <text>微信一键登录</text>
        </button>
        <view v-if="!agreedToTerms" class="login-page__btn-mask" @tap="onWechatButtonTap"></view>
      </view>

      <button class="login-page__btn login-page__btn--outline" @tap="onOtherPhoneLogin">
        其他号码登录
      </button>

      <view class="login-page__agreement">
        <checkbox-group @change="onAgreementChange">
          <label class="login-page__agreement-label">
            <checkbox :checked="agreedToTerms" color="#4b5563" style="transform: scale(0.75)" />
            <text class="login-page__agreement-text">
              我已阅读并同意
              <text class="login-page__agreement-link" @tap.stop="openAgreement('user')"
                >《用户服务协议》</text
              >
              和
              <text class="login-page__agreement-link" @tap.stop="openAgreement('privacy')"
                >《隐私政策》</text
              >
            </text>
          </label>
        </checkbox-group>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";
import { loginWithWechatPhone, AUTH_ERROR_MESSAGE } from "@/api/auth";
import { BusinessError } from "@/utils/request";
import { useLoginFlowStore } from "@/store/login-flow";
import { useUserStore } from "@/store/user";

const agreedToTerms = ref(false);
const loginFlow = useLoginFlowStore();
const userStore = useUserStore();

onLoad(() => {
  // 已登录则跳过登录页，直接进入首页（见 design.md Uniapp 小节 Decisions 第 2 条）
  if (userStore.isLoggedIn) {
    uni.reLaunch({ url: "/pages/index/index" });
  }
});

function onAgreementChange(e: { detail: { value: string[] } }) {
  agreedToTerms.value = e.detail.value.length > 0;
  loginFlow.setAgreedToTerms(agreedToTerms.value);
}

function onWechatButtonTap() {
  if (!agreedToTerms.value) {
    uni.showToast({ title: "请先阅读并同意用户协议和隐私政策", icon: "none" });
  }
}

interface GetPhoneNumberEvent {
  detail: {
    errMsg: string;
    code?: string;
  };
}

async function onGetPhoneNumber(e: GetPhoneNumberEvent) {
  if (!agreedToTerms.value) {
    // 理论上 disabled 态不会触发本回调，这里只是双重保险（见 spec.md「登录前用户协议确认」）
    uni.showToast({ title: "请先阅读并同意用户协议和隐私政策", icon: "none" });
    return;
  }

  const { code, errMsg } = e.detail;

  if (!code) {
    // 用户在微信授权弹窗中点击拒绝/取消（见 spec.md「用户拒绝微信手机号授权」场景）
    if (!/ok$/i.test(errMsg ?? "")) {
      uni.showToast({ title: "已取消微信授权，可使用其他号码登录", icon: "none" });
    }
    return;
  }

  uni.showLoading({ title: "登录中...", mask: true });
  try {
    const result = await loginWithWechatPhone({ code, agreedToTerms: true });
    userStore.login(result);
    uni.reLaunch({ url: "/pages/index/index" });
  } catch (error) {
    const message =
      error instanceof BusinessError
        ? (AUTH_ERROR_MESSAGE[error.code] ?? error.message)
        : "登录失败，请稍后再试";
    uni.showToast({ title: message, icon: "none" });
  } finally {
    uni.hideLoading();
  }
}

function onOtherPhoneLogin() {
  if (!agreedToTerms.value) {
    uni.showToast({ title: "请先阅读并同意用户协议和隐私政策", icon: "none" });
    return;
  }
  uni.navigateTo({ url: "/pages/login/phone" });
}

function openAgreement(type: "user" | "privacy") {
  uni.navigateTo({ url: `/pages/agreement/index?type=${type}` });
}
</script>

<style lang="scss">
.login-page {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  padding: 0 60rpx;
  padding-bottom: calc(60rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background-color: #fff;
}

.login-page__top {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 180rpx;
}

.login-page__avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 2rpx dashed #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  background-color: #f5f5f5;
}

.login-page__avatar-emoji {
  font-size: 64rpx;
}

.login-page__title {
  font-size: 44rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.login-page__subtitle {
  font-size: 26rpx;
  color: #999;
}

.login-page__bottom {
  display: flex;
  flex-direction: column;
}

.login-page__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  border: none;
}

.login-page__btn + .login-page__btn,
.login-page__btn-wrap + .login-page__btn {
  margin-top: 24rpx;
}

.login-page__btn::after {
  border: none;
}

.login-page__btn--wechat {
  background-color: #4b5563;
  color: #fff;
}

.login-page__btn-wrap {
  position: relative;
}

.login-page__btn-mask {
  position: absolute;
  inset: 0;
}

.login-page__btn-icon {
  margin-right: 10rpx;
}

.login-page__btn--outline {
  background-color: #fff;
  color: #333;
  border: 2rpx solid #e0e0e0;
}

.login-page__agreement {
  margin-top: 8rpx;
}

.login-page__agreement-label {
  display: flex;
  align-items: flex-start;
}

.login-page__agreement-text {
  font-size: 22rpx;
  color: #999;
  line-height: 1.6;
}

.login-page__agreement-link {
  color: #4b5563;
}
</style>
