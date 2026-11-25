<template>
  <web-view v-if="src" :src="src" />
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";

const src = ref("");

const FILES: Record<string, { file: string; title: string }> = {
  user: { file: "terms", title: "用户服务协议" },
  terms: { file: "terms", title: "用户服务协议" },
  privacy: { file: "privacy", title: "隐私政策" },
};

onLoad((options) => {
  const type = (options as { type?: string } | undefined)?.type ?? "user";
  const page = FILES[type] ?? FILES.user;
  uni.setNavigationBarTitle({ title: page.title });
  src.value = agreementUrl(page.file);
});

/** 协议页和接口同一套域名：/agreements/terms.html、privacy.html，文内其他协议也是这个路径。 */
function agreementUrl(file: string) {
  const configured = String(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
  const base = configured.startsWith("https://") ? configured : "https://apitest.wandercat.cn";
  return `${base}/agreements/${file}.html`;
}
</script>
