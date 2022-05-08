import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHashHistory } from "vue-router";
import { router } from "./router";
import WaveUI from 'wave-ui'
import 'wave-ui/dist/wave-ui.css'
import axios from 'axios';
import { store } from './store';


if(store.isIosApp && !store.iosAppOptions) {
    let numChecks = 0;
    function checkOptions() {
        setTimeout(() => {
            ++numChecks;
            store.iosAppOptions = (window as any).iosAppOptions;
            if(!store.iosAppOptions && numChecks < 20) {
                checkOptions();
            }
        }, 1000);
    }
    checkOptions();
}

let script = document.createElement('script') as HTMLScriptElement;
script.setAttribute("async","");
if(window.location.href.indexOf('localhost') > -1 || window.location.href.indexOf('staging') > -1) {
    script.src = "https://sandbox.web.squarecdn.com/v1/square.js";
} else {
    script.src = "https://web.squarecdn.com/v1/square.js";
}
document.body.appendChild(script);

var app = createApp(App)
new WaveUI(app, {
    colors: {
        primary: "#4473e6",
        info: "#3B9FEF",
        secondary: "#4378e7"
    }
});

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