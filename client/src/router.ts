import { createRouter, createWebHashHistory } from "vue-router"


export var routes = [
    { path: "/", component: () => import("./pages/Home.vue") },
    { path: "/login", component: () => import("./pages/Login.vue") },
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})