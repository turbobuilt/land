import { createRouter, createWebHashHistory } from "vue-router"


export var routes = [
    { path: "/", component: () => import("./pages/Home.vue") },
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})