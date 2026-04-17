import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import App from "./App.vue";
import WebBoardView from "./views/web-board-view.vue";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap";

const routes = [{ path: "/", name: "board", component: WebBoardView }];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");
