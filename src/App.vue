<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/user";

onLaunch(() => {
  // 小程序冷启动：从本地 Storage 恢复登录态到内存（见 store/user.ts 说明）
  useUserStore().restore();
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>

<style>
/* 全局样式，按项目视觉规范补充，可在此引入 uni.scss 变量生成的全局样式 */
</style>
