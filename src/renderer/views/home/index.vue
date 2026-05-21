<template>
  <div class="home-container h-full w-full bg-white dark:bg-black transition-colors duration-500 overflow-hidden flex flex-col">
    <!-- Top Header Area -->
    <div class="px-8 py-6 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
      <div class="flex items-center gap-4">
        <n-avatar
          round
          size="large"
          :src="userStore.user?.avatarUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
        />
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {{ userStore.user?.nickname || '未登录' }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            清吧音乐播控中心
          </p>
        </div>
      </div>
      <n-button v-if="!userStore.isLoggedIn" type="primary" @click="router.push('/login')">
        前往登录
      </n-button>
      <div v-else class="flex items-center gap-3">
        <n-button type="primary" ghost @click="syncPlaylists">
          <template #icon><i class="ri-refresh-line"></i></template>
          同步歌单
        </n-button>
        <n-button type="success" @click="router.push('/immersive')">
          <template #icon><i class="ri-fullscreen-fill"></i></template>
          进入沉浸大屏
        </n-button>
        <n-button type="error" ghost @click="handleLogout">
          <template #icon><i class="ri-logout-box-r-line"></i></template>
          退出登录
        </n-button>
      </div>
    </div>

    <!-- Main Scrollable Area -->
    <n-scrollbar class="flex-1 px-8 py-6">
      <div class="max-w-5xl mx-auto space-y-8 pb-32">
        
        <!-- Scheduler Section -->
        <scheduler-panel />

        <!-- My Playlists Section -->
        <div class="playlists-section">
          <h2 class="text-xl font-bold flex items-center gap-2 mb-6 text-gray-800 dark:text-gray-100">
            <i class="ri-play-list-2-fill text-blue-500"></i>
            我的歌单
          </h2>

          <div v-if="!userStore.isLoggedIn" class="py-12 text-center text-gray-500">
            请先登录网易云账号以获取您的歌单。
          </div>
          
          <div v-else-if="playlists.length === 0" class="py-12 text-center text-gray-500">
            没有找到歌单，或正在加载中...
          </div>

          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <div
              v-for="playlist in playlists"
              :key="playlist.id"
              class="playlist-card group cursor-pointer"
              @click="playPlaylist(playlist.id)"
            >
              <div class="relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800 shadow-sm transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-lg">
                <img :src="playlist.coverImgUrl" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <i class="ri-play-fill text-5xl text-white"></i>
                </div>
              </div>
              <h3 class="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">
                {{ playlist.name }}
              </h3>
              <p class="mt-1 text-xs text-gray-500">
                {{ playlist.trackCount }} 首歌曲
              </p>
            </div>
          </div>
        </div>

      </div>
    </n-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { NAvatar, NButton, NScrollbar, useMessage } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getListDetail } from '@/api/list';
import { getUserPlaylist } from '@/api/user';
import { usePlayerCoreStore } from '@/store/modules/playerCore';
import { usePlaylistStore } from '@/store/modules/playlist';
import { useUserStore } from '@/store/modules/user';

import SchedulerPanel from './components/SchedulerPanel.vue';

defineOptions({
  name: 'Home'
});

const router = useRouter();
const message = useMessage();
const userStore = useUserStore();
const playlistStore = usePlaylistStore();
const playerCoreStore = usePlayerCoreStore();

const playlists = ref<any[]>([]);

const syncPlaylists = async () => {
  if (!userStore.user?.userId) return;
  try {
    const res = await getUserPlaylist(Number(userStore.user.userId), 100);
    if (res.data?.playlist) {
      playlists.value = res.data.playlist;
      message.success('歌单同步成功');
    }
  } catch (err) {
    message.error('歌单同步失败');
    console.error(err);
  }
};

const handleLogout = () => {
  userStore.logout();
  playlists.value = [];
  message.success('已退出登录');
};

const playPlaylist = async (id: number) => {
  message.loading('正在加载歌单...', { duration: 2000 });
  try {
    const res = await getListDetail(id);
    const tracks = res.data?.playlist?.tracks || [];
    if (tracks.length > 0) {
      const mappedTracks = tracks.map((song: any) => ({
        id: song.id,
        name: song.name,
        picUrl: song.al?.picUrl || song.album?.picUrl,
        ar: song.artists || song.ar,
        al: song.al || song.album,
        source: 'netease',
        song,
        ...song
      }));
      playlistStore.setPlayList(mappedTracks, false, false);
      const { playTrack } = await import('@/services/playbackController');
      await playTrack(mappedTracks[0], true);
      
      // Auto enter immersive mode
      router.push('/immersive');
    } else {
      message.error('歌单为空');
    }
  } catch (err) {
    message.error('加载歌单失败');
    console.error(err);
  }
};

onMounted(() => {
  if (userStore.isLoggedIn) {
    syncPlaylists();
  }
});
</script>

<style lang="scss" scoped>
.playlist-card {
  will-change: transform;
}
</style>
