<template>
  <div class="layout-page h-screen w-screen overflow-hidden bg-white dark:bg-black">
    <router-view
      v-slot="{ Component }"
      class="h-full w-full"
    >
      <keep-alive :include="keepAliveInclude">
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <update-modal v-if="isElectron" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';

import UpdateModal from '@/components/common/UpdateModal.vue';
import homeRouter from '@/router/home';
import { useSettingsStore } from '@/store/modules/settings';
import { isElectron } from '@/utils';

const keepAliveInclude = computed(() => {
  return homeRouter
    .filter((item) => item.meta?.keepAlive)
    .map((item) => {
      return typeof item.name === 'string'
        ? item.name.charAt(0).toUpperCase() + item.name.slice(1)
        : '';
    })
    .filter(Boolean);
});

const settingsStore = useSettingsStore();

onMounted(() => {
  settingsStore.initializeSettings();
  settingsStore.initializeTheme();
});
</script>
