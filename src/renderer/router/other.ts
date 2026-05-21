const otherRouter = [
  {
    path: '/music-list/:id?',
    name: 'musicList',
    meta: {
      title: '音乐列表',
      keepAlive: false,
      showInMenu: false,
      back: true
    },
    component: () => import('@/views/music/MusicListPage.vue')
  },
  {
    path: '/playlist/import',
    name: 'playlistImport',
    meta: {
      title: '歌单导入',
      keepAlive: true,
      back: true
    },
    component: () => import('@/views/playlist/ImportPlaylist.vue')
  }
];
export default otherRouter;
