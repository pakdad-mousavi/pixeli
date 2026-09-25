import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("@/views/index.vue"),
    },
    {
      path: "/merge",
      component: () => import("@/views/Merge.vue"),
    },
    {
      path: "/export",
      component: () => import("@/views/Export.vue"),
    },
  ],
});

export default router;
