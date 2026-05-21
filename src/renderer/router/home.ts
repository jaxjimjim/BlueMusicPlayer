const layoutRouter = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: 'comp.home',
      icon: 'icon-Home',
      keepAlive: true,
      isMobile: true
    },
    component: () => import('@/views/home/index.vue')
  },
  {
    path: '/user',
    name: 'user',
    meta: {
      title: 'comp.user',
      icon: 'icon-Profile',
      keepAlive: true,
      noScroll: true,
      isMobile: true
    },
    component: () => import('@/views/user/index.vue')
  },
  {
    path: '/set',
    name: 'set',
    meta: {
      title: 'comp.settings',
      icon: 'ri-settings-3-fill',
      keepAlive: true,
      noScroll: true,
      back: true
    },
    component: () => import('@/views/set/index.vue')
  }
];
export default layoutRouter;
