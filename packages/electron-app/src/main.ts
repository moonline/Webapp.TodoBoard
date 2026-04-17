import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import App from "./App.vue";
import ElectronBoardView from "./views/electron-board-view.vue";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap";

const routes = [{ path: "/", name: "board", component: ElectronBoardView }];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");
