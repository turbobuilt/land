import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHashHistory } from "vue-router";
import { router } from "./router";
import axios from 'axios';
import { store } from './store';
import { createVuetify } from 'vuetify'
import vuetify from './plugins/vuetify'
import "vuetify/dist/vuetify.min.css";
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


export function initVuetify() {
    return createVuetify({
        icons: {
            defaultSet: 'mdi',
        },
        components,
        directives,
    } as any);
}
const vuetify = initVuetify();
console.log(vuetify);



var app = createApp(App);

app.use(vuetify);
app.use(router);
app.mount('#app')

axios.interceptors.request.use(function (config) {
    if(store.token) {
        if(config.url.indexOf("http") != 0 || config.url.indexOf(window.location.origin) == 0) {
            config.headers.Authorization = store.token.token;
        }
    }
    return config;
});

export { app };