import { createRouter, createWebHashHistory } from "vue-router";

import Page1 from "@/components/Page1.vue";
import Page2 from "@/components/Page2.vue";

const routes = [
  { path: "/", component: Page1 },
  { path: "/page1", component: Page1 },
  { path: "/page2", component: Page2 },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
