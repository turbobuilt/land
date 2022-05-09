<template>
    <div class="app">
        <div class="menu-bar">
            <div class="menu-logo-container">
                <div class="logo"><router-link :to="`/`" class="logo-link"><img src="/logo.png" /></router-link></div>
            </div> 
            <div class="menu-toggle-container">
                <a class="menu-icon" @click="toggleMenu()">☰</a>
            </div> 
            <div class="menu-links" :class="{'toggled': data.menuToggled}" @click="toggleMenu()">
                <template>
                    
                </template>
                <router-link active-class="active" :to="`/login`" v-if="!data.store.user"><div>Login</div></router-link>
                <a class="logout" v-if="data.store.user" @click="logout"><div>Logout</div></a>
            </div>
        </div>
        <router-view></router-view>
        <div class="footer">
            
        </div>
    </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted } from "@vue/runtime-core";
import { useRoute } from "vue-router";
import { router } from "./router";
import { store } from "./store";
import { reactive } from "vue";

function logout(){
    // data.menuToggled = false;
    localStorage.clear();
    store.token = null;
    store.user = null;
    store.requestedRoute = null;
    router.push("/login");
}

(window as any).showError = function(msg: string) {
    alertify.alert("Error: " + msg);
}

const data = reactive({
    store,
    menuToggled: false
});

function toggleMenu(){
    data.menuToggled = !data.menuToggled
}

let urlData = window.location.href.match(/\blogin=(.+)/);
if(urlData) {
    let authData = decodeURIComponent(urlData[1]);
    window.location.href=window.location.origin + "/webapp/";
}

try {
    store.token = JSON.parse(localStorage.getItem("token") as string);
    store.user = JSON.parse(localStorage.getItem("user") as string);
    if(store.token.tokenExpires < Date.now()/1000) {
        console.error("token expired")
        throw new Error("Error - token is expired");
    }
} catch(err) {
    if(window.location.href.indexOf('payment_intent_client_secret') == -1) {
        localStorage.clear();
    }
    store.token = null;
    store.user = null;
    var path = window.location.hash.slice(1); //router.currentRoute.value.path is always / on initialization so have to use hash
    nextTick(() => {
        if(path == "/support") {
            store.requestedRoute = path;
            router.push("/login");
        }
    })
}

function removeTouches(){
    let touchActiveNodes = document.querySelectorAll(".touch-down");
    for(var i = 0; i < touchActiveNodes.length; ++i) {
        touchActiveNodes[i].className = touchActiveNodes[i].className.replace(/\btouch-down\b/,"");
    }
}
document.addEventListener('touchstart', function(event) {
    removeTouches();
    (event.target as HTMLElement).className = (event.target as HTMLElement).className.replace(/\btouch-down\b/,"") + " touch-down";
})
document.addEventListener("touchend", removeTouches);
document.addEventListener("touchcancel", removeTouches);


</script>
<style lang="scss">

</style>
