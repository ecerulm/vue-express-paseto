import { createApp } from "vue";
import App from "./App.vue";

import "bootstrap";
import "./assets/main.css";

const app = createApp(App);

import router from "./routes.js";
app.use(router);

app.mount("#app");
