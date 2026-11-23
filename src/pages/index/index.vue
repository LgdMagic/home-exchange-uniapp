<template>
  <view class="home" :style="{ height: `${scrollHeight}px` }">
    <view class="nav" :style="{ height: `${navHeight}px`, paddingTop: `${statusBarHeight}px` }">
      <image class="brand" src="/static/home/brand.png" mode="widthFix" />
    </view>

    <scroll-view
      v-if="feed"
      scroll-y
      class="home__scroll"
      :style="{ height: `${contentHeight}px` }"
    >
    <view class="home__body">
      <view class="today">
        <view class="today__copy">
          <text class="en en--today">Today</text>
          <text class="guide">今天适合去哪里生活？</text>
          <view class="gold"></view>
          <text class="place">{{ feed.today.place }}</text>
          <text class="desc">{{ feed.today.description }}</text>
          <view class="tags">
            <text v-for="tag in feed.today.tags" :key="tag" class="tags__item">{{ tag }}</text>
          </view>
          <text class="weather">{{ feed.today.weatherText }}</text>
          <view class="pill" @tap="stay">
            <text class="pill__text">查看今日推荐</text>
            <text class="pill__arrow">›</text>
          </view>
        </view>
        <view class="today__photo">
          <image class="cover" :src="homeImageSrc(feed.today.imageKey)" mode="aspectFill" />
          <view class="tip">
            <text class="tip__title">{{ feed.today.livingTipTitle }}</text>
            <text class="tip__body">{{ feed.today.livingTipBody }}</text>
          </view>
        </view>
      </view>

      <view class="inspire">
        <view class="inspire__head">
          <view>
            <text class="en">Inspiration</text>
            <text class="guide">来自会员们的生活灵感</text>
          </view>
          <view class="more" @tap="stay">
            <text class="more__text">更多灵感</text>
            <text class="more__arrow">›</text>
          </view>
        </view>
        <view class="inspire__row">
          <view
            v-for="item in feed.inspirations"
            :key="item.imageKey"
            class="inspire__item"
            @tap="stay"
          >
            <image class="inspire__photo" :src="homeImageSrc(item.imageKey)" mode="aspectFill" />
            <text class="inspire__title">{{ item.title }}</text>
            <text class="inspire__sub">{{ item.subtitle }}</text>
          </view>
        </view>
      </view>

      <view class="feature">
        <view class="feature__main">
          <text class="en">Story</text>
          <text class="guide">本周发生的故事</text>
          <view class="member">
            <image class="member__avatar" :src="homeImageSrc(feed.story.avatarKey)" mode="aspectFill" />
            <view class="member__meta">
              <text class="member__name">{{ feed.story.memberName }}</text>
              <text class="member__status">{{ feed.story.statusText }}</text>
            </view>
          </view>
          <view class="quote">
            <text class="quote__text">{{ quoted(feed.story.quote) }}</text>
            <text class="quote__time">{{ feed.story.timeText }}</text>
          </view>
          <view class="pill" @tap="stay">
            <text class="pill__text">阅读完整故事</text>
            <text class="pill__arrow">›</text>
          </view>
        </view>
        <image class="feature__photo" :src="homeImageSrc(feed.story.imageKey)" mode="aspectFill" />
      </view>

      <view class="feature">
        <view class="feature__main">
          <text class="en">Weekend</text>
          <text class="guide guide--strong">去别人的城市，过一个周末</text>
          <text class="place">{{ feed.weekend.place }}</text>
          <text class="line">{{ feed.weekend.watchingText }}</text>
          <text class="line">{{ feed.weekend.startedText }}</text>
          <text class="line">{{ feed.weekend.durationText }}</text>
          <view class="pill" @tap="stay">
            <text class="pill__text">查看周末计划</text>
            <text class="pill__arrow">›</text>
          </view>
        </view>
        <image class="feature__photo" :src="homeImageSrc(feed.weekend.imageKey)" mode="aspectFill" />
      </view>

      <view class="feature" @tap="stay">
        <view class="feature__main">
          <text class="en">Belong</text>
          <text class="guide">总有一种生活</text>
          <text class="guide guide--next">会让你觉得属于那里</text>
          <text class="belong__title">{{ feed.belong.title }}</text>
          <text v-for="moment in feed.belong.moments" :key="moment.period" class="belong__line">
            {{ moment.text }}
          </text>
        </view>
        <image class="feature__photo" :src="homeImageSrc(feed.belong.imageKey)" mode="aspectFill" />
      </view>

      <view class="start">
        <image class="start__art" src="/static/home/cta-mark.jpg" mode="aspectFill" />
        <text class="start__title">Start  Your  First</text>
        <text class="start__title">Living  Exchange</text>
        <view class="gold"></view>
        <text class="start__desc">去别人的城市，生活一段时间。</text>
        <view class="pill pill--start" @tap="startExchange">
          <text class="pill__text">开始我的第一次生活交换</text>
          <text class="pill__arrow">›</text>
        </view>
      </view>

      <view class="home__safe" :style="{ height: `${safeBottom + 24}px` }"></view>
    </view>
    </scroll-view>

    <view v-else class="home--state" :style="{ height: `${contentHeight}px` }">
      <text v-if="failed" class="state__text">首页加载失败</text>
      <view v-if="failed" class="pill" @tap="load">
        <text class="pill__text">重试</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getHomeFeed, homeImageSrc, type HomeFeed } from "@/api/home-feed";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const feed = ref<HomeFeed | null>(null);
const failed = ref(false);
const scrollHeight = ref(0);
const statusBarHeight = ref(20);
const navHeight = ref(64);
const safeBottom = ref(0);
const contentHeight = ref(0);

function readWindow() {
  const info = uni.getSystemInfoSync();
  const status = info.statusBarHeight || 20;
  scrollHeight.value = info.windowHeight;
  statusBarHeight.value = status;
  let bar = 44;
  const menu = uni.getMenuButtonBoundingClientRect?.();
  if (menu && menu.height && menu.top >= status) {
    bar = (menu.top - status) * 2 + menu.height;
  }
  navHeight.value = status + bar;
  contentHeight.value = Math.max(0, scrollHeight.value - navHeight.value);
  const inset = info.safeAreaInsets?.bottom;
  safeBottom.value = typeof inset === "number" ? inset : 0;
}

readWindow();

onShow(() => {
  readWindow();
  void load();
});

async function load() {
  try {
    feed.value = await getHomeFeed();
    failed.value = false;
  } catch {
    failed.value = feed.value == null;
  }
}

function quoted(quote: string) {
  const text = quote.trim();
  if (text.startsWith('"') || text.startsWith("“")) return text;
  return `"${text}"`;
}

function stay() {
  // 本期内容入口不进入详情。
}

function startExchange() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  uni.navigateTo({ url: "/pages/living-days/index" });
}
</script>

<style lang="scss">
.home {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #ffffff;
}

.nav {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  box-sizing: border-box;
  padding-left: 58rpx;
  background-color: #ffffff;
}

.home__scroll {
  width: 100%;
}

.home__body,
.home--state {
  padding-right: 58rpx;
  padding-left: 58rpx;
  box-sizing: border-box;
}

.home--state {
  background-color: #ffffff;
}

.brand {
  display: block;
  width: 175rpx;
}

.en,
.guide,
.place,
.desc,
.weather,
.line,
.belong__title,
.belong__line,
.inspire__title,
.inspire__sub,
.member__name,
.member__status,
.quote__text,
.quote__time,
.start__title,
.start__desc,
.pill__text,
.pill__arrow,
.state__text,
.tip__title,
.tip__body {
  display: block;
}

.en {
  font-size: 32rpx;
  line-height: 1;
  font-weight: 700;
  color: #232423;
}

.en--today {
  font-size: 40rpx;
}

.guide {
  margin-top: 16rpx;
  font-size: 16rpx;
  line-height: 1.2;
  color: #999999;
}

.guide--strong {
  font-weight: 600;
}

.guide--next {
  margin-top: 4rpx;
}

.gold {
  width: 36rpx;
  height: 2rpx;
  margin-top: 12rpx;
  background-color: #d7b08a;
}

.today {
  display: flex;
  align-items: flex-start;
  margin-top: 36rpx;
}

.today__copy {
  flex: 1;
  min-width: 0;
  padding-top: 16rpx;
  padding-right: 16rpx;
}

.place {
  margin-top: 24rpx;
  font-size: 21rpx;
  line-height: 1.2;
  font-weight: 600;
  color: #232423;
}

.desc {
  margin-top: 12rpx;
  font-size: 19rpx;
  line-height: 1.3;
  letter-spacing: 0.045em;
  color: #666666;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.tags__item {
  height: 38rpx;
  padding: 0 16rpx;
  border-radius: 19rpx;
  background-color: #f5f5f5;
  color: #666666;
  font-size: 17rpx;
  line-height: 38rpx;
}

.weather,
.line {
  margin-top: 16rpx;
  font-size: 16rpx;
  line-height: 1.4;
  color: #999999;
}

.today__photo {
  position: relative;
  width: 339rpx;
  height: 433rpx;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 11rpx;
  background-color: #d8d8d8;
}

.cover,
.inspire__photo,
.feature__photo,
.member__avatar {
  width: 100%;
  height: 100%;
  background-color: #d8d8d8;
}

.tip {
  position: absolute;
  left: 48%;
  top: 69%;
  width: 45%;
  padding: 12rpx 14rpx;
  box-sizing: border-box;
  border-radius: 13rpx;
  background-color: #fefefe;
}

.tip__title {
  font-size: 17rpx;
  line-height: 1.2;
  letter-spacing: 0.045em;
  color: #d7b08a;
}

.tip__body {
  margin-top: 8rpx;
  font-size: 12rpx;
  line-height: 1.35;
  letter-spacing: 0.045em;
  color: #666666;
}

.pill {
  display: inline-flex;
  align-items: center;
  height: 37rpx;
  margin-top: 28rpx;
  padding: 0 18rpx;
  border-radius: 19rpx;
  background-color: #232423;
}

.pill__text,
.pill__arrow {
  color: #ffffff;
  font-size: 15rpx;
  line-height: 37rpx;
  letter-spacing: 0.09em;
}

.pill__arrow {
  margin-left: 8rpx;
  letter-spacing: 0;
}

.inspire,
.feature,
.start {
  margin-top: 27rpx;
  border-radius: 14rpx;
  background-color: #f8f6f2;
}

.inspire {
  padding: 29rpx 29rpx 32rpx;
}

.inspire__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.more {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.more__text,
.more__arrow {
  font-size: 16rpx;
  line-height: 1;
  color: #999999;
}

.more__arrow {
  margin-left: 6rpx;
}

.inspire__row {
  display: flex;
  gap: 11rpx;
  margin-top: 24rpx;
}

.inspire__item {
  flex: 1;
  min-width: 0;
}

.inspire__photo {
  display: block;
  height: 202rpx;
  border-radius: 11rpx;
}

.inspire__title {
  margin-top: 24rpx;
  font-size: 21rpx;
  line-height: 1.2;
  font-weight: 600;
  color: #232423;
}

.inspire__sub {
  margin-top: 8rpx;
  font-size: 16rpx;
  line-height: 1.3;
  color: #999999;
}

.feature {
  display: flex;
  align-items: center;
  min-height: 367rpx;
  padding: 30rpx 24rpx;
  box-sizing: border-box;
}

.feature__main {
  flex: 1;
  min-width: 0;
  padding-right: 16rpx;
}

.feature__photo {
  width: 280rpx;
  height: 280rpx;
  flex-shrink: 0;
  border-radius: 11rpx;
}

.member {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}

.member__avatar {
  width: 76rpx;
  height: 80rpx;
  flex-shrink: 0;
  border-radius: 8rpx;
}

.member__meta {
  margin-left: 12rpx;
  min-width: 0;
}

.member__name {
  font-size: 16rpx;
  line-height: 1.2;
  font-weight: 600;
  color: #232423;
}

.member__status {
  margin-top: 6rpx;
  font-size: 16rpx;
  line-height: 1.2;
  color: #999999;
}

.quote {
  display: flex;
  align-items: flex-end;
  margin-top: 16rpx;
}

.quote__text {
  flex: 1;
  min-width: 0;
  font-size: 19rpx;
  line-height: 1.45;
  font-weight: 700;
  letter-spacing: 0.045em;
  color: #666666;
}

.quote__time {
  flex-shrink: 0;
  margin-left: 8rpx;
  font-size: 12rpx;
  line-height: 1.2;
  color: #999999;
}

.belong__title {
  margin-top: 20rpx;
  font-size: 21rpx;
  line-height: 1.2;
  font-weight: 600;
  color: #232423;
}

.belong__line {
  margin-top: 8rpx;
  font-size: 16rpx;
  line-height: 1.45;
  color: #666666;
}

.start {
  position: relative;
  overflow: hidden;
  min-height: 247rpx;
  padding: 29rpx 29rpx 32rpx;
  box-sizing: border-box;
}

.start__art {
  position: absolute;
  top: 25rpx;
  right: 0;
  width: 400rpx;
  height: 185rpx;
}

.start__title,
.start__desc,
.start .gold,
.pill--start {
  position: relative;
  z-index: 1;
}

.start__title {
  width: 284rpx;
  font-size: 32rpx;
  line-height: 1.15;
  font-weight: 700;
  color: #232423;
}

.start__desc {
  margin-top: 16rpx;
  font-size: 16rpx;
  line-height: 1.2;
  color: #999999;
}

.state__text {
  margin-top: 80rpx;
  font-size: 28rpx;
  color: #666666;
}
</style>
