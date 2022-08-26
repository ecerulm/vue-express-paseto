import { createRouter, createWebHashHistory } from "vue-router";

import Page1 from "@/components/Page1.vue";
import Page2 from "@/components/Page2.vue";
import LoginPage from "@/components/LoginPage.vue";

const routes = [
  { path: "/", component: Page1 },
  { path: "/login", component: LoginPage },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
