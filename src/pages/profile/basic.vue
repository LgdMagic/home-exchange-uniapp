<template>
  <profile-scaffold v-if="ready" title="个人资料" :step="1" button-text="下一步" hide-button>
    <form @submit="onFormSubmit">
    <view class="card">
      <view class="card__head">
        <view class="card__bar"></view>
        <text class="card__title">基础信息</text>
      </view>

      <view class="avatar">
        <view class="avatar__circle">
          <image
            v-if="avatarPreview"
            class="avatar__image"
            :src="avatarPreview"
            mode="aspectFill"
          />
          <view v-else class="avatar__plus">
            <view class="avatar__plus-h"></view>
            <view class="avatar__plus-v"></view>
          </view>
          <button class="avatar__hit" open-type="chooseAvatar" @chooseavatar="onChooseAvatar" />
        </view>
        <view class="avatar__texts">
          <text class="avatar__name">上传头像</text>
          <text class="avatar__caption">点击更换头像</text>
        </view>
      </view>

      <view class="field">
        <text class="field__label">昵称 *</text>
        <view class="field__box">
          <input
            class="field__input"
            type="nickname"
            name="nickname"
            maxlength="50"
            placeholder="请输入昵称"
            placeholder-class="field__placeholder"
            :value="nickname"
            @input="onNickname"
            @change="onNickname"
            @blur="onNickname"
          />
        </view>
      </view>

      <view class="field">
        <text class="field__label">真实姓名 *</text>
        <view class="field__box">
          <text :class="realName ? 'field__value' : 'field__placeholder'">
            {{ realName ? `已实名认证·${realName}` : "已实名认证·张***" }}
          </text>
        </view>
      </view>

      <view class="field">
        <text class="field__label">性别 *</text>
        <view class="gender">
          <view
            v-for="item in GENDER_OPTIONS"
            :key="item.value"
            class="gender__item"
            :class="{ 'gender__item--on': gender === item.value }"
            @tap="selectGender(item.value)"
          >
            <text class="gender__text">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="field">
        <text class="field__label">出生日期</text>
        <view class="field__box">
          <text :class="birthDateText ? 'field__value' : 'field__placeholder'">
            {{ birthDateText || "请选择日期" }}
          </text>
        </view>
      </view>

      <view class="field">
        <text class="field__label">职业</text>
        <view class="field__box">
          <input
            v-model="occupation"
            class="field__input"
            maxlength="100"
            placeholder="请选择职业"
            placeholder-class="field__placeholder"
          />
        </view>
      </view>

      <view class="field">
        <text class="field__label">所在城市 *</text>
        <picker
          mode="multiSelector"
          :range="cityRange"
          :value="cityIndexes"
          @columnchange="onCityColumnChange"
          @change="onCityChange"
        >
          <view class="field__box">
            <text :class="city ? 'field__value' : 'field__placeholder'">
              {{ city ? cityLabel(city) : "请选择城市" }}
            </text>
          </view>
        </picker>
      </view>

      <view class="field">
        <text class="field__label">联系电话（选填）</text>
        <view class="field__box">
          <text class="field__value">{{ phoneText }}</text>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card__head">
        <view class="card__bar"></view>
        <text class="card__title">自我介绍 About Me</text>
      </view>
      <text class="card__desc">一段简短的自我介绍，让房主/房客更好地了解你（选填）</text>
      <view class="field__box field__box--area">
        <textarea
          v-model="bio"
          class="field__textarea"
          maxlength="200"
          auto-height
          placeholder="介绍一下自己吧，比如你的性格、旅行习惯、为什么喜欢交换住宿.."
          placeholder-class="field__placeholder"
        />
      </view>
      <text class="field__count">{{ bio.length }}/200</text>
    </view>
    <view class="profile__action">
      <button class="profile__submit" @tap="onSubmit">下一步</button>
    </view>
    </form>
  </profile-scaffold>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import ProfileScaffold from "@/components/profile/profile-scaffold.vue";
import { GENDER_OPTIONS } from "@/constants/profile-options";
import {
  CITY_OTHER,
  PROVINCE_CITIES,
  cityLabel,
  findCityIndexes,
  toCityValue,
} from "@/constants/cities";
import { updateBasicInfo, updateWechatIdentity, uploadAvatar } from "@/api/profile";
import { useProfileStore } from "@/store/profile";
import { useUserStore } from "@/store/user";
import {
  ensureProfileStep,
  formatBirthDate,
  isPersistableAvatar,
  showProfileError,
} from "@/utils/profile-flow";

const userStore = useUserStore();
const profileStore = useProfileStore();

const ready = ref(false);
const submitting = ref(false);
const realName = ref("");
const birthDateText = ref("");
const nickname = ref("");
const gender = ref<"MALE" | "FEMALE">("MALE");
const occupation = ref("");
const city = ref("");
const bio = ref("");
const avatarPreview = ref("");
const remoteAvatar = ref("");
const provinceIndex = ref(0);
const cityIndex = ref(0);

const phoneText = computed(() => {
  const account = userStore.account;
  if (!account) return "";
  return `${account.countryCode} ${account.phoneNumber}`;
});

const cityRange = computed(() => {
  const provinces = [...PROVINCE_CITIES.map((item) => item.province), "其他"];
  const cities =
    provinceIndex.value >= PROVINCE_CITIES.length
      ? ["其他"]
      : (PROVINCE_CITIES[provinceIndex.value]?.cities ?? []);
  return [provinces, cities];
});

const cityIndexes = computed(() => [provinceIndex.value, cityIndex.value]);

onLoad(async () => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: "/pages/login/index" });
    return;
  }
  try {
    const allowed = await ensureProfileStep("basic");
    if (!allowed) return;
    const profile = profileStore.profile;
    if (!profile) return;
    realName.value = profile.realName ?? "";
    birthDateText.value = formatBirthDate(profile.birthDate);
    nickname.value = profile.nickname || userStore.account?.nickname || "";
    gender.value = profile.gender ?? "MALE";
    occupation.value = profile.occupation ?? "";
    city.value = profile.city ?? "";
    bio.value = profile.bio ?? "";
    const avatar = profile.avatarUrl || userStore.account?.avatarUrl || "";
    remoteAvatar.value = avatar;
    avatarPreview.value = avatar;
    const [province, cityIdx] = findCityIndexes(profile.city);
    provinceIndex.value = province;
    cityIndex.value = cityIdx;
    ready.value = true;
  } catch (error) {
    showProfileError(error, "资料加载失败");
  }
});

function onChooseAvatar(event: { detail?: { avatarUrl?: string } }) {
  const next = event.detail?.avatarUrl;
  if (next) avatarPreview.value = next;
}

function onNickname(event: Event) {
  const value = (event as { detail?: { value?: string } }).detail?.value;
  if (typeof value === "string") nickname.value = value.trim();
}

function onFormSubmit(event: Event) {
  const fromForm = (event as { detail?: { value?: { nickname?: string } } }).detail?.value
    ?.nickname;
  if (typeof fromForm === "string" && fromForm.trim()) nickname.value = fromForm.trim();
  void onSubmit();
}

function onCityColumnChange(event: { detail: { column: number; value: number } }) {
  if (event.detail.column === 0) {
    provinceIndex.value = event.detail.value;
    cityIndex.value = 0;
  }
}

function onCityChange(event: { detail: { value: number[] } }) {
  const [provinceIdx, nextCityIdx] = event.detail.value;
  provinceIndex.value = provinceIdx;
  cityIndex.value = nextCityIdx;
  if (provinceIdx >= PROVINCE_CITIES.length) {
    city.value = CITY_OTHER;
    return;
  }
  const province = PROVINCE_CITIES[provinceIdx];
  const name = province.cities[nextCityIdx] ?? province.cities[0];
  city.value = toCityValue(province.province, name);
}

function selectGender(value: string) {
  if (value === "MALE" || value === "FEMALE") gender.value = value;
}

function toast(title: string) {
  uni.showToast({ title, icon: "none" });
}

async function onSubmit() {
  if (submitting.value) return;
  const nextNickname = nickname.value.trim();
  if (!nextNickname) {
    toast("请填写昵称");
    return;
  }
  if (!city.value) {
    toast("请选择所在城市");
    return;
  }
  if (!realName.value || !birthDateText.value) {
    toast("待实名信息带出");
    return;
  }

  submitting.value = true;
  try {
    const identity: { nickname: string; avatarUrl?: string } = { nickname: nextNickname };
    if (avatarPreview.value && avatarPreview.value !== remoteAvatar.value) {
      identity.avatarUrl = isPersistableAvatar(avatarPreview.value)
        ? avatarPreview.value
        : (await uploadAvatar(avatarPreview.value)).avatarUrl;
      avatarPreview.value = identity.avatarUrl;
      remoteAvatar.value = identity.avatarUrl;
    }
    await updateWechatIdentity(identity);
    userStore.updateIdentity({
      nickname: nextNickname,
      avatarUrl: identity.avatarUrl ?? remoteAvatar.value ?? null,
    });

    await updateBasicInfo({
      gender: gender.value,
      city: city.value,
      occupation: occupation.value.trim(),
      bio: bio.value.trim(),
    });

    uni.navigateTo({ url: "/pages/profile/lifestyle" });
  } catch (error) {
    showProfileError(error, "保存失败，请稍后再试");
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss">
@import "../../styles/profile-card.scss";

.profile__action {
  margin: 48rpx 63rpx 32rpx;
}

button.profile__submit {
  width: 100%;
  height: 104rpx;
  line-height: 104rpx;
  margin: 0;
  padding: 0;
  border-radius: 78px;
  overflow: hidden;
  background-color: #232423;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 400;
  border: none;
  box-sizing: border-box;
}

button.profile__submit::after {
  border: none;
  border-radius: 78px;
}
</style>
