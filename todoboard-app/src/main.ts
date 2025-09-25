import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import BoardView from "./views/board-view.vue";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

const routes = [{ path: "/", name: "board", component: BoardView }];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");
