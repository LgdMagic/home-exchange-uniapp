<template>
  <view class="content">
    <view class="text-area">
      <text class="title">{{ title }}</text>
      <text class="subtitle">项目初始化完成，开始按 OpenSpec Change 开发吧</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

const title = ref("房屋互换");
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
</style>
