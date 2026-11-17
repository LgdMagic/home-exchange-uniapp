<template>
  <view class="agreement-page">
    <text class="agreement-page__title">{{ title }}</text>
    <view class="agreement-page__placeholder">
      <text class="agreement-page__placeholder-text">
        协议正文内容待补充。正式版本见 product/
        目录下相关协议文档，具体以线上页面还是小程序原生页面展示， 待产品 Agent
        确认后调整本页实现（见 design.md「add-customer-phone-login」Uniapp 小节 Open Questions 第 3
        条）。
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";

const title = ref("用户服务协议");

onLoad((options) => {
  const type = (options as { type?: string } | undefined)?.type;
  title.value = type === "privacy" ? "隐私政策" : "用户服务协议";
  uni.setNavigationBarTitle({ title: title.value });
});
</script>

<style lang="scss">
.agreement-page {
  min-height: 100vh;
  background-color: #fff;
  padding: 40rpx;
  box-sizing: border-box;
}

.agreement-page__title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 32rpx;
  display: block;
}

.agreement-page__placeholder {
  background-color: #f8f8f8;
  border-radius: 16rpx;
  padding: 32rpx;
}

.agreement-page__placeholder-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
}
</style>
