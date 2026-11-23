<template>
  <view class="chips">
    <text class="chips__label">{{ label }}</text>
    <view class="chips__list">
      <view
        v-for="item in options"
        :key="item.value"
        class="chips__item"
        :class="{ 'chips__item--on': selected(item.value), 'chips__item--half': columns === 2 }"
        @tap="toggle(item.value)"
      >
        <text class="chips__text">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ProfileOption } from "@/constants/profile-options";

const props = defineProps<{
  label: string;
  options: ProfileOption[];
  modelValue: string | string[];
  multiple?: boolean;
  columns?: 2 | 3;
}>();

const emit = defineEmits<{
  "update:modelValue": [string | string[]];
}>();

function selected(value: string) {
  return Array.isArray(props.modelValue)
    ? props.modelValue.includes(value)
    : props.modelValue === value;
}

function toggle(value: string) {
  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? props.modelValue : [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    emit("update:modelValue", next);
    return;
  }
  emit("update:modelValue", value);
}
</script>

<style lang="scss">
.chips {
  margin-top: 71rpx;
}

.chips__label {
  display: block;
  margin-bottom: 23rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #666666;
}

.chips__list {
  display: flex;
  flex-wrap: wrap;
  column-gap: 12rpx;
  row-gap: 27rpx;
}

.chips__item {
  width: calc((100% - 24rpx) / 3);
  height: 60rpx;
  padding: 0 8rpx;
  border: 1rpx solid #808080;
  border-radius: 30rpx;
  background-color: #f8f6f2;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chips__item--half {
  width: calc((100% - 12rpx) / 2);
}

.chips__item--on {
  background-color: #e6e6e6;
}

.chips__text {
  font-size: 29rpx;
  color: #808080;
  line-height: 1.2;
  text-align: center;
}
</style>
