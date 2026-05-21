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
  }
];
export default layoutRouter;
