<template>
  <div class="scheduler-panel bg-gray-50 dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <i class="ri-calendar-schedule-line text-blue-500"></i>
        定时播放排班表
      </h2>
      <n-button type="primary" size="small" @click="addNewSchedule" class="!px-4">
        <template #icon>
          <i class="ri-add-line"></i>
        </template>
        新增排班
      </n-button>
    </div>

    <n-alert v-if="schedules.length === 0" type="info" class="mb-4" :show-icon="true">
      暂无排班。您可以设置在指定时间自动切换到指定的网易云歌单。
    </n-alert>

    <div class="space-y-4">
      <div 
        v-for="(schedule, index) in schedules" 
        :key="index"
        class="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-zinc-800 p-4 rounded-lg border border-gray-100 dark:border-zinc-700 transition-shadow hover:shadow-md"
      >
        <!-- Time Picker -->
        <div class="w-full md:w-1/4">
          <n-time-picker
            v-model:formatted-value="schedule.time"
            format="HH:mm"
            placeholder="选择时间"
            :actions="['confirm']"
            class="w-full"
            @update:value="saveSchedules"
          />
        </div>

        <!-- Playlist Selector -->
        <div class="w-full md:w-2/4">
          <n-select
            v-model:value="schedule.playlist_id"
            :options="playlistOptions"
            placeholder="请选择要播放的歌单"
            class="w-full"
            @update:value="(val, option) => onPlaylistChange(schedule, option)"
          />
        </div>

        <!-- Delete Button -->
        <div class="w-full md:w-1/4 flex justify-end">
          <n-button type="error" ghost @click="removeSchedule(index)">
            删除
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core';
import { NAlert, NButton, NSelect, NTimePicker, useMessage } from 'naive-ui';
import { computed, onMounted, ref } from 'vue';

import { getUserPlaylist } from '@/api/user';
import { useUserStore } from '@/store/modules/user';

const message = useMessage();
const userStore = useUserStore();

interface Schedule {
  time: string;
  name: string;
  playlist_id: string;
}

const schedules = ref<Schedule[]>([]);
const userPlaylists = ref<any[]>([]);

// Convert user playlists to select options
const playlistOptions = computed(() => {
  return userPlaylists.value.map((p) => ({
    label: p.name,
    value: p.id.toString(),
  }));
});

// Load user playlists from Netease
const loadPlaylists = async () => {
  if (userStore.user?.userId) {
    try {
      const res = await getUserPlaylist(Number(userStore.user.userId), 100);
      if (res.data?.playlist) {
        userPlaylists.value = res.data.playlist;
      }
    } catch (err) {
      console.error('Failed to load playlists', err);
    }
  }
};

// Load schedules from Tauri Backend
const loadSchedules = async () => {
  try {
    const isTauri = (window as any).__TAURI__ !== undefined;
    if (isTauri) {
      const res = await invoke<Schedule[]>('get_schedules');
      schedules.value = res || [];
    } else {
      const res = localStorage.getItem('schedules');
      schedules.value = res ? JSON.parse(res) : [];
    }
  } catch (err) {
    console.error('Failed to load schedules', err);
    message.error('无法加载排班表数据');
  }
};

// Save schedules to Tauri Backend
const saveSchedules = async () => {
  try {
    const isTauri = (window as any).__TAURI__ !== undefined;
    if (isTauri) {
      await invoke('set_schedules', { schedules: schedules.value });
    } else {
      localStorage.setItem('schedules', JSON.stringify(schedules.value));
    }
    message.success('排班已保存');
  } catch (err) {
    console.error('Failed to save schedules', err);
    message.error('保存排班失败');
  }
};

const addNewSchedule = () => {
  schedules.value.push({
    time: '12:00',
    name: '新排班',
    playlist_id: ''
  });
  saveSchedules();
};

const removeSchedule = (index: number) => {
  schedules.value.splice(index, 1);
  saveSchedules();
};

const onPlaylistChange = (schedule: Schedule, option: any) => {
  if (option) {
    schedule.name = option.label;
  }
  saveSchedules();
};

onMounted(async () => {
  await loadPlaylists();
  await loadSchedules();
});
</script>
