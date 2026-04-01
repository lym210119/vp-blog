---
title: tab 底部圆形边框衔接
lang: en-US
---

# tab 底部圆形边框衔接


<script setup>
import CircleBorder from './CircleBorder.vue'
</script>

```vue
<template>
  <div class="container">
    <div class="tab">
      <div
          class="tab-item"
          :class="{ active: tabId === item }"
          v-for="item in 10"
          :key="item"
          @click="tabId = item"
        >
          <span class="before"></span>
          <span class="line"></span>
          <span>tab {{ item }}</span>
          <span class="after"></span>
      </div>
    </div>

    <div class="flex-1">123</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const tabId = ref(1)
</script>

<style scoped>
.container {
  @apply h-750px w-375px bg-gray-100 flex border border-gray-300 border-solid
}
.tab {
  @apply w-120px bg-white py-20px
}

.tab-item {
  @apply py-20px text-center cursor-pointer relative
}
.tab-item::before,
.tab-item::after {
  @apply content-[''] absolute right-0 w-10px h-10px
}

.line {
  @apply absolute top-0 left-0 translate-y-1/2 w-3px h-28px rounded-r-5px
}
.active {
  @apply bg-gray-100 rounded-l-10px color-blue
}

.active .line {
  @apply bg-blue
}

.before,
.after {
  @apply absolute right-0 w-10px h-10px
}

/* 
  重点
  利用选中项的 .before 和 ::before 重叠定位到右上角
  利用选中项的 .after 和 ::after 重叠定位到右下角
*/
.active::before {
  @apply top--10px rounded-br-10px bg-white z-2
}
.active .before {
  @apply top--10px bg-gray-100 z-1
}

.active::after {
  @apply bottom--10px rounded-tr-10px bg-white z-2
}

.active .after {
  @apply bottom--10px bg-gray-100 z-1
}
</style>
```


<CircleBorder />