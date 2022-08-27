import { createRouter, createWebHashHistory } from "vue-router";

import Home from "@/components/Home.vue";
import NotLoggedIn from "@/components/NotLoggedIn.vue";
import Page1 from "@/components/Page1.vue";
import Page2 from "@/components/Page2.vue";
import LoginPage from "@/components/LoginPage.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/notloggedin", component: NotLoggedIn },
  { path: "/login", component: LoginPage },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
