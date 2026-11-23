<template>
  <view v-if="ready" class="realname">
    <view class="realname__nav" :style="{ paddingTop: `${statusBarHeight}px` }">
      <view class="realname__back" @tap="goBack">
        <text class="realname__back-icon">‹</text>
      </view>
      <text class="realname__nav-title">身份证信息</text>
    </view>

    <scroll-view scroll-y class="realname__scroll">
      <view class="realname__body">
      <text class="realname__heading">实名认证</text>

      <view class="field">
        <text class="field__label">姓名 *</text>
        <view class="field__box">
          <input
            v-model="realName"
            class="field__input"
            maxlength="30"
            placeholder="请输入与身份证一致的姓名"
            placeholder-class="field__placeholder"
          />
        </view>
      </view>

      <view class="field">
        <text class="field__label">身份证号 *</text>
        <view class="field__box">
          <input
            v-model="idCardNumber"
            class="field__input"
            maxlength="18"
            placeholder="请输入 18 位身份证号码"
            placeholder-class="field__placeholder"
          />
        </view>
      </view>

      <text class="realname__photo-title">证件照片</text>
      <text class="realname__photo-hint">请上传身份证人像面和国徽面，确保证件清晰、边角完整</text>
      <view class="realname__photos">
        <view class="realname__photo" @tap="choosePhoto('portrait')">
          <image
            v-if="portraitPath"
            class="realname__photo-image"
            :src="portraitPath"
            mode="aspectFill"
          />
          <image
            v-else
            class="realname__placeholder realname__placeholder--people"
            src="/static/images/people.png"
            mode="aspectFit"
          />
          <view class="realname__corner realname__corner--tl"></view>
          <view class="realname__corner realname__corner--tr"></view>
          <view class="realname__corner realname__corner--bl"></view>
          <view class="realname__corner realname__corner--br"></view>
          <text class="realname__photo-label">{{ portraitPath || !frontUploaded ? "人像面" : "已上传" }}</text>
        </view>
        <view class="realname__photo" @tap="choosePhoto('emblem')">
          <image
            v-if="emblemPath"
            class="realname__photo-image"
            :src="emblemPath"
            mode="aspectFill"
          />
          <image
            v-else
            class="realname__placeholder realname__placeholder--emblem"
            src="/static/images/guohui.png"
            mode="aspectFit"
          />
          <view class="realname__corner realname__corner--tl"></view>
          <view class="realname__corner realname__corner--tr"></view>
          <view class="realname__corner realname__corner--bl"></view>
          <view class="realname__corner realname__corner--br"></view>
          <text class="realname__photo-label">{{ emblemPath || !backUploaded ? "国徽面" : "已上传" }}</text>
        </view>
      </view>

      <text class="realname__privacy">
        信息仅用于实名认证与预订核验，全程加密存储，脱敏展示（如"张*"），不会向其他用户公开
      </text>

      <button class="realname__submit" @tap="onSubmit">提交认证</button>
      <view class="realname__safe" :style="{ height: `${safeBottom}px` }"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  getRealNameVerification,
  submitRealNameVerification,
  uploadIdCardPhoto,
  type IdCardPhotoSide,
} from "@/api/profile";
import { useProfileStore } from "@/store/profile";
import { useUserStore } from "@/store/user";
import { isValidIdCardNumber } from "@/utils/id-card";
import { REAL_NAME_PATH, resumePath, showProfileError } from "@/utils/profile-flow";
import { BusinessError } from "@/utils/request";

const userStore = useUserStore();
const profileStore = useProfileStore();

const ready = ref(false);
const submitting = ref(false);
const realName = ref("");
const idCardNumber = ref("");
const portraitPath = ref("");
const emblemPath = ref("");
const frontUploaded = ref(false);
const backUploaded = ref(false);
let frontToken = 0;
let backToken = 0;
let frontTask: Promise<void> | null = null;
let backTask: Promise<void> | null = null;
const statusBarHeight = ref(20);
const safeBottom = ref(0);

onLoad(async () => {
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
    return;
  }

  try {
    const verification = await getRealNameVerification();
    if (verification.submitted) {
      await leaveForProfile();
      return;
    }
    frontUploaded.value = verification.idCardFrontUploaded;
    backUploaded.value = verification.idCardBackUploaded;
    ready.value = true;
  } catch (error) {
    showProfileError(error, "实名状态加载失败");
  }
});

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: "/pages/mine/index" });
    },
  });
}

async function leaveForProfile() {
  const profile = await profileStore.load();
  const next = resumePath(profile);
  if (next && next !== REAL_NAME_PATH) {
    uni.redirectTo({ url: next });
    return;
  }
  uni.switchTab({ url: "/pages/mine/index" });
}

function toast(title: string) {
  uni.showToast({ title, icon: "none" });
}

function choosePhoto(side: "portrait" | "emblem") {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success(result) {
      const path = result.tempFilePaths[0];
      if (!path) return;
      const apiSide: IdCardPhotoSide = side === "portrait" ? "FRONT" : "BACK";
      const token = apiSide === "FRONT" ? ++frontToken : ++backToken;
      if (apiSide === "FRONT") portraitPath.value = path;
      else emblemPath.value = path;

      const task = uploadIdCardPhoto(path, apiSide)
        .then(() => {
          if (apiSide === "FRONT" && token === frontToken) frontUploaded.value = true;
          if (apiSide === "BACK" && token === backToken) backUploaded.value = true;
        })
        .catch((error: unknown) => {
          showProfileError(error, "照片上传失败");
          throw error;
        });
      if (apiSide === "FRONT") frontTask = task;
      else backTask = task;
    },
  });
}

async function ensurePhoto(
  path: string,
  uploaded: boolean,
  task: Promise<void> | null,
  side: IdCardPhotoSide,
) {
  if (task) {
    try {
      await task;
      return;
    } catch {
      // 选图时上传失败，提交时再传一次当前这张。
    }
  }
  if (path) {
    await uploadIdCardPhoto(path, side);
    return;
  }
  if (!uploaded) {
    throw new BusinessError(
      21008,
      side === "FRONT" ? "请上传身份证人像面" : "请上传身份证国徽面",
    );
  }
}

async function onSubmit() {
  if (submitting.value) return;
  const name = realName.value.trim();
  if (!name) {
    toast("请填写姓名");
    return;
  }
  if (name.length > 30) {
    toast("姓名需为 1–30 个字");
    return;
  }
  const idCard = idCardNumber.value.trim().toUpperCase();
  if (!idCard) {
    toast("请填写身份证号");
    return;
  }
  if (!isValidIdCardNumber(idCard)) {
    toast("身份证号格式不正确");
    return;
  }
  const missingFront = !portraitPath.value && !frontUploaded.value;
  const missingBack = !emblemPath.value && !backUploaded.value;
  if (missingFront && missingBack) {
    toast("请上传身份证人像面和国徽面");
    return;
  }
  if (missingFront) {
    toast("请上传身份证人像面");
    return;
  }
  if (missingBack) {
    toast("请上传身份证国徽面");
    return;
  }

  submitting.value = true;
  try {
    await ensurePhoto(portraitPath.value, frontUploaded.value, frontTask, "FRONT");
    frontUploaded.value = true;
    await ensurePhoto(emblemPath.value, backUploaded.value, backTask, "BACK");
    backUploaded.value = true;
    await submitRealNameVerification({ realName: name, idCardNumber: idCard });
    idCardNumber.value = "";
    uni.redirectTo({ url: "/pages/profile/basic" });
  } catch (error) {
    if (error instanceof BusinessError && error.code === 21007) {
      await leaveForProfile();
      return;
    }
    showProfileError(error, "提交失败，请稍后再试");
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss">
@import "../../styles/profile-card.scss";

.realname {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.realname__nav {
  height: 88rpx;
  box-sizing: content-box;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #ffffff;
}

.realname__back {
  position: absolute;
  left: 24rpx;
  bottom: 12rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.realname__back-icon {
  font-size: 48rpx;
  line-height: 1;
  color: #232423;
}

.realname__nav-title {
  font-size: 40rpx;
  color: #000000;
}

.realname__scroll {
  flex: 1;
  height: 0;
}

.realname__body {
  padding: 48rpx 43rpx 32rpx;
}

.realname__heading {
  display: block;
  margin-bottom: 48rpx;
  text-align: center;
  font-size: 53rpx;
  font-weight: 700;
  color: #333333;
}

.realname__photo-title {
  display: block;
  margin-top: 48rpx;
  text-align: center;
  font-size: 53rpx;
  font-weight: 700;
  color: #333333;
}

.realname__photo-hint {
  display: block;
  margin-top: 16rpx;
  text-align: center;
  font-size: 19rpx;
  color: #808080;
}

.realname__photos {
  margin-top: 28rpx;
  display: flex;
  justify-content: center;
  gap: 41rpx;
}

.realname__photo {
  position: relative;
  width: 276rpx;
  height: 276rpx;
  overflow: hidden;
  background-color: #ffffff;
}

.realname__photo-image {
  width: 276rpx;
  height: 276rpx;
}

.realname__placeholder {
  position: absolute;
}

.realname__placeholder--people {
  left: 78rpx;
  top: 48rpx;
  width: 120rpx;
  height: 132rpx;
}

.realname__placeholder--emblem {
  left: 76rpx;
  top: 52rpx;
  width: 124rpx;
  height: 128rpx;
}

.realname__corner {
  position: absolute;
  width: 36rpx;
  height: 36rpx;
  border-color: #e6e6e6;
  border-style: solid;
}

.realname__corner--tl {
  top: 0;
  left: 0;
  border-width: 6rpx 0 0 6rpx;
}

.realname__corner--tr {
  top: 0;
  right: 0;
  border-width: 6rpx 6rpx 0 0;
}

.realname__corner--bl {
  bottom: 0;
  left: 0;
  border-width: 0 0 6rpx 6rpx;
}

.realname__corner--br {
  right: 0;
  bottom: 0;
  border-width: 0 6rpx 6rpx 0;
}

.realname__photo-label {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 36rpx;
  text-align: center;
  font-size: 17rpx;
  color: #808080;
}

.realname__privacy {
  display: block;
  margin-top: 48rpx;
  font-size: 19rpx;
  line-height: 1.5;
  color: #808080;
}

.realname__submit {
  margin-top: 32rpx;
  height: 104rpx;
  line-height: 104rpx;
  border-radius: 78px;
  overflow: hidden;
  background-color: #232423;
  color: #ffffff;
  font-size: 40rpx;
  border: none;
}

.realname__submit::after {
  border: none;
  border-radius: 78px;
}

.realname__safe {
  width: 100%;
}
</style>
