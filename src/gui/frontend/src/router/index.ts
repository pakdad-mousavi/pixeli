import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/index.vue'),
    },
    {
      path: '/grid',
      component: () => import('@/views/Grid.vue'),
    },
    {
      path: '/masonry',
      component: () => import('@/views/Masonry.vue'),
    },
    {
      path: '/collage',
      component: () => import('@/views/Collage.vue'),
    },
    {
      path: '/template',
      component: () => import('@/views/Template.vue'),
    },
  ],
});

export default router;
