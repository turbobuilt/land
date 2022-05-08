<template>
    <w-app class="app">
        <!-- <div v-if="!data.store.user" class="menu-bar">
            <div class="menu-logo-container">
                <div class="logo"><img src="/logo.png" /></div>
            </div> 
            <div class="menu-toggle-container">
                <a class="menu-icon" @click="toggleMenu()">☰</a>
            </div> 
            <div class="menu-links" :class="{'toggled': data.menuToggled}" @click="toggleMenu">
                <router-link :to="`/`" :class="{'toggled': data.menuToggled}">Upload File</router-link>
                <router-link :to="`/login`" :class="{'toggled': data.menuToggled}">Login</router-link>
            </div>
        </div> -->
        <div class="menu-bar" v-if="!store.isIosApp || store.user">
            <div class="menu-logo-container">
                <div class="logo"><router-link :to="`/`" class="logo-link"><img src="/logo.png" /></router-link></div>
            </div> 
            <div class="menu-toggle-container">
                <a class="menu-icon" @click="toggleMenu()">☰</a>
            </div> 
            <div class="menu-links" :class="{'toggled': data.menuToggled}" @click="toggleMenu()">
                <router-link active-class="active" :to="`/webapp`"><div>Process File</div></router-link>
                <template v-if="!store.isIosApp">
                    <a href="/about"><div>About</div></a>
                    <a href="/contact-us"><div>Contact</div></a>
                    <a href="/articles"><div>Articles</div></a>
                </template>
                <router-link active-class="active" :to="`/login`" v-if="!data.store.user"><div>Login</div></router-link>
                <router-link active-class="active" to="/support" v-if="data.store.user"><div>Support</div></router-link>
                <router-link active-class="active" to="/account" v-if="data.store.user"><div>Account</div></router-link>
                <a class="logout" v-if="data.store.user" @click="logout"><div>Logout</div></a>
            </div>
        </div>
        <router-view></router-view>
        <div class="footer" v-if="!store.isIosApp || store.user">
            <router-link :to="`/terms`">Terms</router-link>
            <router-link :to="`/privacy`">Privacy</router-link>
            <router-link :to="`/licenses`">Licenses</router-link>
        </div>
    </w-app>
</template>
<script setup lang="ts">
import { nextTick, onMounted } from "@vue/runtime-core";
import { useRoute } from "vue-router";
import { router } from "./router";
import { store } from "./store";
import { reactive } from "vue";
import { setAuthCredentials } from "./lib/user/auth";
import { notify } from "./lib/notify/notify";

function logout(){
    // data.menuToggled = false;
    localStorage.clear();
    store.token = null;
    store.user = null;
    store.requestedRoute = null;
    router.push("/login");
}

(window as any).showError = function(msg: string) {
    notify("Error: " + msg);
}

const data = reactive({
    store,
    menuToggled: false
})

onMounted(() => {
    if(store.isIosApp && parseInt(store.iosAppOptions.build) < 13) {
        notify(`
        <div>Upgrade is Recommended!</div>
        <br><br>
        <a class="w-button primary--bg size--md" href="https://apps.apple.com/gh/app/noise-destroyer/id1607886443">Click and Hold To Upgrade App (then click "Open Link")</a>
        <br><br>
        <div>You need to upgrade your app in the app store because this version doesn't work right.  It will work for noise removal, but account features are buggy right now and it works best if you just upgrade!  Thank you for your support as I work to improve the product! You all are amazing!</div>
        <br>
        <br><br>
        <div>
        Thank you for your patience as I work to improve the product!
        </div>
        `);
    }
})

function toggleMenu(){
    data.menuToggled = !data.menuToggled
}

let urlData = window.location.href.match(/\blogin=(.+)/);
if(urlData) {
    let authData = decodeURIComponent(urlData[1]);
    setAuthCredentials(atob(authData));
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

* { 
    transition: .1s background-color;
    font-family: var(--e-global-typography-ef2c50b-font-family),Sans-serif;
    font-size: var(--e-global-typography-ef2c50b-font-size);
    font-weight: var(--e-global-typography-ef2c50b-font-weight);
}
@import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');
// @import url('https://fonts.googleapis.com/css2?family=Varela+Round:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Prata:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=PT+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Italiana:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Cormorant+Upright:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Cormorant+Infant:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Jost:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Pinyon+Script:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');


.w-overlay.w-dialog.absolute {
    position: absolute;
    top: 0;
    // bottom: 0;
    left: 0;
    right: 0;
    padding-bottom: 50px;
    min-height: 100%;
}
body .w-button:before {
    content: none;
}
.page {
    flex-grow: 1;
}
.footer {
    background: gainsboro;
    padding: 30px;
    a {
        color: gray;
        &:hover {
            color: #444444;
        }
        margin-right: 20px;
    }
}

button.touch-down {
    opacity: .5;
}


body .w-app .primary--bg {
    // background-color: var(--e-global-color-accent);
}

body .w-app .w-button {
    letter-spacing: var(--e-global-typography-accent-letter-spacing);
    // fill: #fff;
    // color: #fff;
    // color: #363636;
    // color: black;
    border-radius: 30px 30px 30px 30px;
    // box-shadow: 0 0 30px 0 rgb(53 56 240 / 50%);
}

body .w-dialog .w-card {
    max-width: 98%;
    max-height: 98%;
    width: 600px;
    flex-grow: 0;
}

@media (max-width: 1000px) {
    body .w-button.size--md {
        height: 35px;
    }
    body .w-button {
        // -webkit-tap-highlight-color: #ccc;
        user-select: none;
    }
    // body .w-button:hover {
    //     opacity: .5;
    // }
}

#appleid-signin {
    height: 43px;
}
body .green-audio-player {
    max-width: none;
    width: auto;
}

.menu-bar {
    position:sticky;
    top: 0;
    z-index: 100;
    .menu-logo-container {
        display: flex;
        align-items: center;
    }
    @media (max-width: 1024px) {
        .menu-logo-container {
            // display: none;
        }
        padding: 0;
        flex-wrap: wrap;
        align-items: center;
        .menu-toggle-container a:after {
            display: none;
        }
        .menu-links {
            width: 100%;
            a {
                border-top: 1px solid white;
                &:after {
                    display: none;
                }
            }
        }
        // flex-direction: column;
        a, .menu-links {
            display: none;
            &.toggled, &.toggled a {
                display: block;
            }
        }
        .menu-icon{
            width: auto;
            padding-left: 10px;
            padding-right: 10px;
            display: flex;
            align-items: center;
            color: white;
            font-size: 30px;
            margin-right: 10px;
        }
        // >div, a {
        //     width: 100%;
        //     flex-wrap: wrap;
        //     margin: 0;
        // }
    }
    @media (min-width: 1024px) {
        .menu-toggle-container {
            display: none;
        }
    }
    .logo-link {
        padding: 0;
    }
    // padding: 0 10px;
    // background: #3d9ff5; //rgb(251, 255, 0);
    background: linear-gradient(to right,$primary,$info); // linear-gradient(130deg,var(--e-global-color-primary) 0%,var(--e-global-color-accent) 100%);
    display: flex;
    justify-content: space-between;
    .sign-up {
        background: teal;
        color: white;
    }
    .logo {
        font-weight: bold;
        font-size: 20px;
        width: 150px;
        padding: 15px;
        display: flex;  
        align-items: center;
        img {
            // width: 100%;
            height: 40px;
        }
    }
    .menu-toggle-logo-container {
        display: flex;
        align-items: center;
        .logo {
            // margin-left: 10px;
        }
    }
    > div {
        display: flex;
    }
    a {
        color: white;
        display: flex;
        align-items: center;
        padding: 0px var(--e-nav-menu-horizontal-menu-item-margin);
        font-weight: 300;
        &.logout {
            margin-right: 0;
        }
        font-weight: bold;
        cursor: pointer;
        position: relative;
        @media(min-width: 1024px) {
            &:hover {
                // background: rgb(0, 110, 255);
                color: white;    
                color: var(--e-global-color-f898f31);
                fill: var(--e-global-color-f898f31);
            }
        }
        div {
            position: relative;
            height: 100%;
            padding: var(--e-nav-menu-horizontal-menu-item-margin) 0px;
        }
        div:hover, div.active {
            &:after {
                bottom: 0;
                opacity: 1;
            }
        }
        &.active  {
            color: $red;
            text-shadow: 0 0 4px black;
            font-weight: bold;
        }
        div:after {
            opacity: 0;
            bottom: 10px;
            background-color: $red; //var(--e-global-color-f898f31);
            height: 2px;
            content: "";
            width: 100%;
            left: 0;
            z-index: 2;
            -webkit-transform: scale(1);
            -ms-transform: scale(1);
            transform: scale(1);
            display: block;
            position: absolute;
            -webkit-transition: .3s;
            -o-transition: .3s;
            transition: .3s;
            -webkit-transition-timing-function: cubic-bezier(.58,.3,.005,1);
            -o-transition-timing-function: cubic-bezier(.58,.3,.005,1);
            transition-timing-function: cubic-bezier(.58,.3,.005,1);
        }
    }
}
html {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
}
body, #app, .app {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    margin: 0;
    padding: 0;
}
* {
    box-sizing: border-box;
}
.sign-in-email-button {
    margin-left: 10px;
    padding: 5px;
}
.sign-in-email-button, .sign-in-button {
    -webkit-border-radius: 4px;
    border-radius: 4px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-transition: background-color .218s,border-color .218s;
    transition: background-color .218s,border-color .218s;
    -webkit-user-select: none;
    -webkit-appearance: none;
    background-color: #fff;
    background-image: none;
    border: 1px solid #dadce0;
    color: #3c4043;
    cursor: pointer;
    // font-family: 'Google Sans',arial,sans-serif;
    font-size: 14px;
    height: 40px;
    letter-spacing: 0.25px;
    outline: none;
    overflow: hidden;
    padding: 0 12px;
    position: relative;
    text-align: center;
    vertical-align: middle;
    white-space: nowrap;
    width: auto;
    display: flex;
    align-items: center;
    justify-content: center;
}







// --e-global-color-primary: $primary;
// --e-global-color-accent: --e-global-color-accent

:root {
    --e-nav-menu-horizontal-menu-item-margin: calc(50px / 2);
    --e-global-color-secondary: #3D4459;
    --e-global-color-text: #353535;
    // --e-global-color-accent: #06D9FA;
    // --e-global-color-primary: #4632DA;
    --e-global-color-0fba91c: #FAB89F;
    --e-global-color-81e8884: #F7F8FA;
    --e-global-color-d4f3030: #D3D3D9;
    --e-global-color-9aa0e29: #29292A00;
    --e-global-color-e0f9d43: #FFFFFF;
    --e-global-color-3b01a33: #848484;
    --e-global-color-65e875c0: #E8EBEA;
    --e-global-color-1fd96a61: #F4F4F4;
    --e-global-color-2ee8cc4b: #000;
    --e-global-color-5daae3fe: #FFF;
    --e-global-color-4440aa9: #FFFFFF00;
    --e-global-color-a856848: #CBD4D4;
    --e-global-color-d256d8a: #A6B4B6;
    --e-global-color-4975e7c: #00000000;
    --e-global-color-5f31dc2: #FFFFFF00;
    --e-global-color-96068f9: #00000080;
    --e-global-color-538425b: #545454;
    --e-global-color-2ea9a25: #000000CF;
    --e-global-color-428b918: #808080;
    --e-global-color-4121729: #FFFFFF00;
    --e-global-color-26947ea: #504DFF;
    --e-global-color-62ecc60: #FFFFFF;
    --e-global-color-85fda33: #E9E9E4;
    --e-global-color-267369c: #000000;
    --e-global-color-fbba6c9: #F4F4F4;
    --e-global-color-97a2f83: #BBBFC4;
    --e-global-color-a2dd949: #FFFFFFCC;
    --e-global-color-f898f31: #FFFEFE;
    --e-global-color-0d046a4: #E9E9E9;
    --e-global-color-c6c574f: #F9F9F9;
    --e-global-color-7ad78f4: #FFFFFFE6;
    --e-global-color-8630d9f: #7E222200;
    --e-global-color-b500f0a: #FFFFFF;
    --e-global-typography-primary-font-family: "Varela Round";
    --e-global-typography-primary-font-size: 45px;
    --e-global-typography-primary-font-weight: 300;
    --e-global-typography-primary-text-transform: capitalize;
    --e-global-typography-primary-font-style: normal;
    --e-global-typography-primary-text-decoration: none;
    --e-global-typography-primary-line-height: 1.2em;
    --e-global-typography-primary-letter-spacing: 0px;
    --e-global-typography-secondary-font-family: "Montserrat";
    --e-global-typography-secondary-font-size: 16px;
    --e-global-typography-secondary-font-weight: 300;
    --e-global-typography-secondary-text-transform: capitalize;
    --e-global-typography-secondary-font-style: normal;
    --e-global-typography-secondary-text-decoration: none;
    --e-global-typography-secondary-line-height: 1.2em;
    --e-global-typography-secondary-letter-spacing: 0px;
    --e-global-typography-text-font-family: "Montserrat";
    --e-global-typography-text-font-size: 16px;
    --e-global-typography-text-font-weight: 300;
    --e-global-typography-text-text-transform: none;
    --e-global-typography-text-font-style: normal;
    --e-global-typography-text-text-decoration: none;
    --e-global-typography-text-line-height: 1.4em;
    --e-global-typography-text-letter-spacing: 1px;
    --e-global-typography-accent-font-family: "Montserrat";
    --e-global-typography-accent-font-size: 16px;
    --e-global-typography-accent-font-weight: 500;
    --e-global-typography-accent-text-transform: capitalize;
    --e-global-typography-accent-font-style: normal;
    --e-global-typography-accent-text-decoration: none;
    --e-global-typography-accent-line-height: 1.2em;
    --e-global-typography-accent-letter-spacing: -0.39px;
    --e-global-typography-f3e9c76-font-family: "Prata";
    --e-global-typography-f3e9c76-font-size: 5.2vw;
    --e-global-typography-f3e9c76-font-weight: 400;
    --e-global-typography-f3e9c76-text-transform: capitalize;
    --e-global-typography-f3e9c76-font-style: normal;
    --e-global-typography-f3e9c76-text-decoration: none;
    --e-global-typography-f3e9c76-line-height: 1em;
    --e-global-typography-f3e9c76-letter-spacing: 10px;
    --e-global-typography-d097826-font-family: "Roboto";
    --e-global-typography-d097826-font-size: 16px;
    --e-global-typography-d097826-font-weight: 400;
    --e-global-typography-d097826-text-transform: uppercase;
    --e-global-typography-d097826-font-style: normal;
    --e-global-typography-d097826-text-decoration: none;
    --e-global-typography-d097826-line-height: 1em;
    --e-global-typography-d097826-letter-spacing: 4px;
    --e-global-typography-043b86e-font-family: "Prata";
    --e-global-typography-043b86e-font-size: 18px;
    --e-global-typography-043b86e-font-weight: 400;
    --e-global-typography-043b86e-text-transform: capitalize;
    --e-global-typography-043b86e-font-style: normal;
    --e-global-typography-043b86e-text-decoration: none;
    --e-global-typography-043b86e-line-height: 1em;
    --e-global-typography-043b86e-letter-spacing: 1.1px;
    --e-global-typography-1f556be-font-family: "Prata";
    --e-global-typography-1f556be-font-size: 32px;
    --e-global-typography-1f556be-font-weight: 400;
    --e-global-typography-1f556be-text-transform: capitalize;
    --e-global-typography-1f556be-font-style: normal;
    --e-global-typography-1f556be-text-decoration: none;
    --e-global-typography-1f556be-line-height: 1.4em;
    --e-global-typography-1f556be-letter-spacing: 0px;
    --e-global-typography-9c609c3-font-family: "PT Sans";
    --e-global-typography-9c609c3-font-size: 16px;
    --e-global-typography-9c609c3-font-weight: 400;
    --e-global-typography-9c609c3-text-transform: uppercase;
    --e-global-typography-9c609c3-font-style: normal;
    --e-global-typography-9c609c3-text-decoration: none;
    --e-global-typography-9c609c3-line-height: 24px;
    --e-global-typography-9c609c3-letter-spacing: 5px;
    --e-global-typography-f966a3a-font-family: "PT Sans";
    --e-global-typography-f966a3a-font-size: 16px;
    --e-global-typography-f966a3a-font-weight: normal;
    --e-global-typography-f966a3a-text-transform: uppercase;
    --e-global-typography-f966a3a-font-style: normal;
    --e-global-typography-f966a3a-text-decoration: none;
    --e-global-typography-f966a3a-line-height: 24px;
    --e-global-typography-f966a3a-letter-spacing: 1px;
    --e-global-typography-d3bce62-font-family: "PT Sans";
    --e-global-typography-d3bce62-font-size: 16px;
    --e-global-typography-d3bce62-font-weight: normal;
    --e-global-typography-d3bce62-text-transform: uppercase;
    --e-global-typography-d3bce62-font-style: normal;
    --e-global-typography-d3bce62-text-decoration: none;
    --e-global-typography-d3bce62-line-height: 22px;
    --e-global-typography-d3bce62-letter-spacing: 3px;
    --e-global-typography-173baee-font-family: "Italiana";
    --e-global-typography-173baee-font-size: 4.6vw;
    --e-global-typography-173baee-font-weight: 400;
    --e-global-typography-173baee-text-transform: uppercase;
    --e-global-typography-173baee-font-style: normal;
    --e-global-typography-173baee-text-decoration: none;
    --e-global-typography-173baee-line-height: 1em;
    --e-global-typography-173baee-letter-spacing: 7px;
    --e-global-typography-3a94527-font-family: "Italiana";
    --e-global-typography-3a94527-font-size: 14px;
    --e-global-typography-3a94527-font-weight: normal;
    --e-global-typography-3a94527-text-transform: uppercase;
    --e-global-typography-3a94527-font-style: normal;
    --e-global-typography-3a94527-text-decoration: none;
    --e-global-typography-3a94527-line-height: 24px;
    --e-global-typography-3a94527-letter-spacing: 2px;
    --e-global-typography-f9f596c-font-family: "PT Sans";
    --e-global-typography-f9f596c-font-size: 14px;
    --e-global-typography-f9f596c-font-weight: normal;
    --e-global-typography-f9f596c-text-transform: capitalize;
    --e-global-typography-f9f596c-font-style: normal;
    --e-global-typography-f9f596c-text-decoration: none;
    --e-global-typography-f9f596c-line-height: 1.4em;
    --e-global-typography-f9f596c-letter-spacing: 1px;
    --e-global-typography-f5cc8bb-font-family: "Cormorant Upright";
    --e-global-typography-f5cc8bb-font-size: 9.3vw;
    --e-global-typography-f5cc8bb-font-weight: 300;
    --e-global-typography-f5cc8bb-text-transform: uppercase;
    --e-global-typography-f5cc8bb-font-style: normal;
    --e-global-typography-f5cc8bb-text-decoration: none;
    --e-global-typography-f5cc8bb-line-height: 0.7em;
    --e-global-typography-f5cc8bb-letter-spacing: -19px;
    --e-global-typography-082a15c-font-family: "Cormorant Infant";
    --e-global-typography-082a15c-font-size: 12vw;
    --e-global-typography-082a15c-font-weight: 300;
    --e-global-typography-082a15c-text-transform: lowercase;
    --e-global-typography-082a15c-font-style: italic;
    --e-global-typography-082a15c-text-decoration: none;
    --e-global-typography-082a15c-line-height: 0.7em;
    --e-global-typography-082a15c-letter-spacing: 0px;
    --e-global-typography-c16f3d9-font-family: "Cormorant Upright";
    --e-global-typography-c16f3d9-font-size: 123px;
    --e-global-typography-c16f3d9-font-weight: 300;
    --e-global-typography-c16f3d9-text-transform: uppercase;
    --e-global-typography-c16f3d9-font-style: normal;
    --e-global-typography-c16f3d9-text-decoration: none;
    --e-global-typography-c16f3d9-line-height: 0.73em;
    --e-global-typography-c16f3d9-letter-spacing: -11px;
    --e-global-typography-17e08b1-font-family: "Montserrat";
    --e-global-typography-17e08b1-font-size: 28px;
    --e-global-typography-17e08b1-font-weight: 300;
    --e-global-typography-17e08b1-text-transform: uppercase;
    --e-global-typography-17e08b1-font-style: normal;
    --e-global-typography-17e08b1-text-decoration: none;
    --e-global-typography-17e08b1-line-height: 26px;
    --e-global-typography-17e08b1-letter-spacing: -1px;
    --e-global-typography-baee8d5-font-family: "Cormorant Infant";
    --e-global-typography-baee8d5-font-size: 11vw;
    --e-global-typography-baee8d5-font-weight: 300;
    --e-global-typography-baee8d5-text-transform: lowercase;
    --e-global-typography-baee8d5-font-style: italic;
    --e-global-typography-baee8d5-text-decoration: none;
    --e-global-typography-baee8d5-line-height: 0.8em;
    --e-global-typography-baee8d5-letter-spacing: -14px;
    --e-global-typography-4d7e31d-font-family: "Cormorant Upright";
    --e-global-typography-4d7e31d-font-size: 11vw;
    --e-global-typography-4d7e31d-font-weight: 300;
    --e-global-typography-4d7e31d-text-transform: uppercase;
    --e-global-typography-4d7e31d-font-style: normal;
    --e-global-typography-4d7e31d-text-decoration: none;
    --e-global-typography-4d7e31d-line-height: 0.8em;
    --e-global-typography-4d7e31d-letter-spacing: -8px;
    --e-global-typography-875204c-font-family: "Cormorant Infant";
    --e-global-typography-875204c-font-size: 68px;
    --e-global-typography-875204c-font-weight: 300;
    --e-global-typography-875204c-text-transform: lowercase;
    --e-global-typography-875204c-font-style: italic;
    --e-global-typography-875204c-text-decoration: none;
    --e-global-typography-875204c-line-height: 38px;
    --e-global-typography-875204c-letter-spacing: -4px;
    --e-global-typography-30be1a2-font-family: "Cormorant Upright";
    --e-global-typography-30be1a2-font-size: 2.7vw;
    --e-global-typography-30be1a2-font-weight: 300;
    --e-global-typography-30be1a2-text-transform: uppercase;
    --e-global-typography-30be1a2-font-style: normal;
    --e-global-typography-30be1a2-text-decoration: none;
    --e-global-typography-30be1a2-line-height: 40px;
    --e-global-typography-30be1a2-letter-spacing: -2px;
    --e-global-typography-401e312-font-family: "Cormorant Upright";
    --e-global-typography-401e312-font-size: 2.2vw;
    --e-global-typography-401e312-font-weight: normal;
    --e-global-typography-401e312-text-transform: uppercase;
    --e-global-typography-401e312-font-style: normal;
    --e-global-typography-401e312-text-decoration: none;
    --e-global-typography-401e312-line-height: 40px;
    --e-global-typography-401e312-letter-spacing: -2px;
    --e-global-typography-cde5516-font-family: "Montserrat";
    --e-global-typography-cde5516-font-size: 18px;
    --e-global-typography-cde5516-font-weight: normal;
    --e-global-typography-cde5516-text-transform: none;
    --e-global-typography-cde5516-font-style: normal;
    --e-global-typography-cde5516-text-decoration: none;
    --e-global-typography-cde5516-line-height: 1.2em;
    --e-global-typography-cde5516-letter-spacing: 0px;
    --e-global-typography-6b5eaed-font-family: "Montserrat";
    --e-global-typography-6b5eaed-font-size: 56px;
    --e-global-typography-6b5eaed-font-weight: 300;
    --e-global-typography-6b5eaed-text-transform: uppercase;
    --e-global-typography-6b5eaed-font-style: normal;
    --e-global-typography-6b5eaed-text-decoration: none;
    --e-global-typography-6b5eaed-line-height: 30px;
    --e-global-typography-6b5eaed-letter-spacing: -1px;
    --e-global-typography-496cd8c-font-family: "Cormorant Upright";
    --e-global-typography-496cd8c-font-size: 123px;
    --e-global-typography-496cd8c-font-weight: 300;
    --e-global-typography-496cd8c-text-transform: uppercase;
    --e-global-typography-496cd8c-font-style: normal;
    --e-global-typography-496cd8c-text-decoration: none;
    --e-global-typography-496cd8c-line-height: 1em;
    --e-global-typography-496cd8c-letter-spacing: -11px;
    --e-global-typography-7a247c0-font-family: "Montserrat";
    --e-global-typography-7a247c0-font-size: 20px;
    --e-global-typography-7a247c0-font-weight: 300;
    --e-global-typography-7a247c0-text-transform: uppercase;
    --e-global-typography-7a247c0-font-style: normal;
    --e-global-typography-7a247c0-text-decoration: none;
    --e-global-typography-7a247c0-line-height: 1em;
    --e-global-typography-7a247c0-letter-spacing: -1px;
    --e-global-typography-fe89058-font-family: "Cormorant Infant";
    --e-global-typography-fe89058-font-size: 4.2vw;
    --e-global-typography-fe89058-font-weight: 300;
    --e-global-typography-fe89058-text-transform: uppercase;
    --e-global-typography-fe89058-font-style: normal;
    --e-global-typography-fe89058-text-decoration: none;
    --e-global-typography-fe89058-line-height: 75px;
    --e-global-typography-fe89058-letter-spacing: -5px;
    --e-global-typography-7e9216c-font-family: "Cormorant Upright";
    --e-global-typography-7e9216c-font-size: 5vw;
    --e-global-typography-7e9216c-font-weight: 300;
    --e-global-typography-7e9216c-text-transform: uppercase;
    --e-global-typography-7e9216c-font-style: normal;
    --e-global-typography-7e9216c-text-decoration: none;
    --e-global-typography-7e9216c-line-height: 0.75em;
    --e-global-typography-7e9216c-letter-spacing: -10px;
    --e-global-typography-9babd6a-font-family: "Montserrat";
    --e-global-typography-9babd6a-font-size: 35px;
    --e-global-typography-9babd6a-font-weight: 300;
    --e-global-typography-9babd6a-text-transform: uppercase;
    --e-global-typography-1cddddb-font-family: "Montserrat";
    --e-global-typography-1cddddb-font-size: 22px;
    --e-global-typography-1cddddb-font-weight: 300;
    --e-global-typography-1cddddb-text-transform: uppercase;
    --e-global-typography-8d326f3-font-family: "Montserrat";
    --e-global-typography-8d326f3-font-size: 60px;
    --e-global-typography-8d326f3-font-weight: 100;
    --e-global-typography-8d326f3-text-transform: capitalize;
    --e-global-typography-8d326f3-font-style: normal;
    --e-global-typography-8d326f3-text-decoration: none;
    --e-global-typography-8d326f3-letter-spacing: 10px;
    --e-global-typography-af368bb-font-family: "Montserrat";
    --e-global-typography-af368bb-font-size: 30px;
    --e-global-typography-af368bb-font-weight: 300;
    --e-global-typography-af368bb-text-transform: capitalize;
    --e-global-typography-af368bb-line-height: 0.8em;
    --e-global-typography-3be91e2-font-family: "Montserrat";
    --e-global-typography-3be91e2-font-size: 15px;
    --e-global-typography-3be91e2-font-weight: 400;
    --e-global-typography-3be91e2-text-transform: capitalize;
    --e-global-typography-b37e92c-font-family: "Montserrat";
    --e-global-typography-b37e92c-font-size: 145px;
    --e-global-typography-b37e92c-font-weight: 300;
    --e-global-typography-b37e92c-text-transform: capitalize;
    --e-global-typography-b37e92c-line-height: 1em;
    --e-global-typography-d31d91d-font-family: "Montserrat";
    --e-global-typography-d31d91d-font-size: 18px;
    --e-global-typography-d31d91d-font-weight: 300;
    --e-global-typography-d31d91d-text-transform: capitalize;
    --e-global-typography-bfafc67-font-family: "Montserrat";
    --e-global-typography-bfafc67-font-size: 15px;
    --e-global-typography-bfafc67-font-weight: 300;
    --e-global-typography-bfafc67-text-transform: uppercase;
    --e-global-typography-1cc69fb-font-family: "Montserrat";
    --e-global-typography-1cc69fb-font-size: 22px;
    --e-global-typography-1cc69fb-font-weight: 300;
    --e-global-typography-1cc69fb-text-transform: capitalize;
    --e-global-typography-c41fd38-font-family: "Jost";
    --e-global-typography-c41fd38-font-size: 25px;
    --e-global-typography-c41fd38-font-weight: 500;
    --e-global-typography-c41fd38-text-transform: capitalize;
    --e-global-typography-c41fd38-font-style: normal;
    --e-global-typography-c41fd38-text-decoration: none;
    --e-global-typography-c41fd38-line-height: 1em;
    --e-global-typography-c41fd38-letter-spacing: 0px;
    --e-global-typography-e368beb-font-family: "Jost";
    --e-global-typography-e368beb-font-size: 25px;
    --e-global-typography-e368beb-font-weight: 400;
    --e-global-typography-e368beb-text-transform: capitalize;
    --e-global-typography-e368beb-font-style: normal;
    --e-global-typography-e368beb-text-decoration: none;
    --e-global-typography-e368beb-line-height: 1.2em;
    --e-global-typography-e368beb-letter-spacing: 0px;
    --e-global-typography-478f05e-font-family: "Jost";
    --e-global-typography-478f05e-font-size: 16px;
    --e-global-typography-478f05e-font-weight: 400;
    --e-global-typography-478f05e-text-transform: capitalize;
    --e-global-typography-478f05e-font-style: normal;
    --e-global-typography-478f05e-text-decoration: none;
    --e-global-typography-478f05e-line-height: 1.5em;
    --e-global-typography-478f05e-letter-spacing: 0px;
    --e-global-typography-2fbecd3-font-family: "Jost";
    --e-global-typography-2fbecd3-font-size: 20px;
    --e-global-typography-2fbecd3-font-weight: 400;
    --e-global-typography-2fbecd3-text-transform: uppercase;
    --e-global-typography-2fbecd3-font-style: normal;
    --e-global-typography-2fbecd3-text-decoration: none;
    --e-global-typography-2fbecd3-line-height: 1.2em;
    --e-global-typography-2fbecd3-letter-spacing: 0px;
    --e-global-typography-84ec12a-font-family: "Jost";
    --e-global-typography-84ec12a-font-size: 20px;
    --e-global-typography-84ec12a-font-weight: 500;
    --e-global-typography-84ec12a-text-transform: uppercase;
    --e-global-typography-84ec12a-font-style: normal;
    --e-global-typography-84ec12a-text-decoration: none;
    --e-global-typography-84ec12a-line-height: 1.2em;
    --e-global-typography-84ec12a-letter-spacing: 0px;
    --e-global-typography-582f940-font-family: "Jost";
    --e-global-typography-582f940-font-size: 20px;
    --e-global-typography-582f940-font-weight: 400;
    --e-global-typography-582f940-text-transform: uppercase;
    --e-global-typography-582f940-font-style: normal;
    --e-global-typography-582f940-text-decoration: none;
    --e-global-typography-582f940-line-height: 1em;
    --e-global-typography-582f940-letter-spacing: 1.38px;
    --e-global-typography-7eecb57-font-family: "Pinyon Script";
    --e-global-typography-7eecb57-font-size: 84px;
    --e-global-typography-7eecb57-font-weight: 400;
    --e-global-typography-7eecb57-text-transform: capitalize;
    --e-global-typography-7eecb57-font-style: normal;
    --e-global-typography-7eecb57-text-decoration: none;
    --e-global-typography-7eecb57-line-height: 1.2em;
    --e-global-typography-7eecb57-letter-spacing: 0px;
    --e-global-typography-4509510-font-family: "Pinyon Script";
    --e-global-typography-4509510-font-size: 12.5vw;
    --e-global-typography-4509510-font-weight: 400;
    --e-global-typography-4509510-text-transform: capitalize;
    --e-global-typography-4509510-font-style: normal;
    --e-global-typography-4509510-text-decoration: none;
    --e-global-typography-4509510-line-height: 0.9em;
    --e-global-typography-4509510-letter-spacing: 0px;
    --e-global-typography-35c6bf8-font-family: "Jost";
    --e-global-typography-35c6bf8-font-size: 12.5vw;
    --e-global-typography-35c6bf8-font-weight: 400;
    --e-global-typography-35c6bf8-text-transform: uppercase;
    --e-global-typography-35c6bf8-font-style: normal;
    --e-global-typography-35c6bf8-text-decoration: none;
    --e-global-typography-35c6bf8-line-height: 0.9em;
    --e-global-typography-35c6bf8-letter-spacing: 0px;
    --e-global-typography-1730b4f-font-family: "Jost";
    --e-global-typography-1730b4f-font-size: 35px;
    --e-global-typography-1730b4f-font-weight: 400;
    --e-global-typography-1730b4f-text-transform: capitalize;
    --e-global-typography-1730b4f-font-style: normal;
    --e-global-typography-1730b4f-text-decoration: none;
    --e-global-typography-1730b4f-line-height: 1.3em;
    --e-global-typography-1730b4f-letter-spacing: 0px;
    --e-global-typography-779c31f-font-family: "Pinyon Script";
    --e-global-typography-779c31f-font-size: 9vw;
    --e-global-typography-779c31f-font-weight: 400;
    --e-global-typography-779c31f-text-transform: capitalize;
    --e-global-typography-779c31f-font-style: normal;
    --e-global-typography-779c31f-text-decoration: none;
    --e-global-typography-779c31f-line-height: 1.2em;
    --e-global-typography-779c31f-letter-spacing: 0px;
    --e-global-typography-7fd093b-font-family: "Jost";
    --e-global-typography-7fd093b-font-size: 26px;
    --e-global-typography-7fd093b-font-weight: 400;
    --e-global-typography-7fd093b-text-transform: uppercase;
    --e-global-typography-7fd093b-font-style: normal;
    --e-global-typography-7fd093b-text-decoration: none;
    --e-global-typography-7fd093b-line-height: 1em;
    --e-global-typography-7fd093b-letter-spacing: 13px;
    --e-global-typography-c841b5e-font-family: "Jost";
    --e-global-typography-c841b5e-font-size: 84px;
    --e-global-typography-c841b5e-font-weight: 500;
    --e-global-typography-c841b5e-text-transform: uppercase;
    --e-global-typography-c841b5e-font-style: normal;
    --e-global-typography-c841b5e-text-decoration: none;
    --e-global-typography-c841b5e-line-height: 0.9em;
    --e-global-typography-c841b5e-letter-spacing: 0.5px;
    --e-global-typography-3a7e4c9-font-family: "Jost";
    --e-global-typography-3a7e4c9-font-size: 18px;
    --e-global-typography-3a7e4c9-font-weight: 400;
    --e-global-typography-3a7e4c9-text-transform: none;
    --e-global-typography-3a7e4c9-font-style: normal;
    --e-global-typography-3a7e4c9-text-decoration: line-through;
    --e-global-typography-3a7e4c9-line-height: 1em;
    --e-global-typography-3a7e4c9-letter-spacing: 1px;
    --e-global-typography-7aa51e8-font-family: "Jost";
    --e-global-typography-7aa51e8-font-size: 18px;
    --e-global-typography-7aa51e8-font-weight: 400;
    --e-global-typography-7aa51e8-text-transform: capitalize;
    --e-global-typography-7aa51e8-font-style: normal;
    --e-global-typography-7aa51e8-text-decoration: none;
    --e-global-typography-7aa51e8-line-height: 1em;
    --e-global-typography-7aa51e8-letter-spacing: 0px;
    --e-global-typography-6ed476c-font-family: "Varela Round";
    --e-global-typography-6ed476c-font-size: 20px;
    --e-global-typography-6ed476c-font-weight: 400;
    --e-global-typography-6ed476c-text-transform: capitalize;
    --e-global-typography-9525bd0-font-family: "Montserrat";
    --e-global-typography-9525bd0-font-size: 20px;
    --e-global-typography-9525bd0-font-weight: 300;
    --e-global-typography-9525bd0-text-transform: capitalize;
    --e-global-typography-cdaaf6a-font-family: "Varela Round";
    --e-global-typography-cdaaf6a-font-size: 16px;
    --e-global-typography-cdaaf6a-font-weight: 300;
    --e-global-typography-cdaaf6a-text-transform: capitalize;
    --e-global-typography-cdaaf6a-font-style: normal;
    --e-global-typography-0009af8-font-family: "Montserrat";
    --e-global-typography-0009af8-font-size: 14px;
    --e-global-typography-0009af8-font-weight: 400;
    --e-global-typography-0009af8-text-transform: capitalize;
    --e-global-typography-0009af8-font-style: normal;
    --e-global-typography-0009af8-letter-spacing: 0px;
    --e-global-typography-ef2c50b-font-family: "Varela Round";
    --e-global-typography-ef2c50b-font-size: 15px;
    --e-global-typography-ef2c50b-font-weight: 300;
    --e-global-typography-f8a9e51-font-family: "Varela Round";
    --e-global-typography-f8a9e51-font-size: 35px;
    --e-global-typography-f8a9e51-font-weight: 300;
    --e-global-typography-f8a9e51-text-transform: capitalize;
    --e-global-typography-f8a9e51-line-height: 1.2em;
    --e-global-typography-ccc280a-font-family: "Varela Round";
    --e-global-typography-ccc280a-font-size: 80px;
    --e-global-typography-ccc280a-font-weight: 300;
    --e-global-typography-ccc280a-text-transform: capitalize;
    --e-global-typography-ccc280a-line-height: 1.2em;
    --e-global-typography-2c11d45-font-family: "Varela Round";
    --e-global-typography-2c11d45-font-size: 50px;
    --e-global-typography-2c11d45-font-weight: 500;
    --e-global-typography-2c11d45-text-transform: capitalize;
    --e-global-typography-2c11d45-line-height: 1.2em;
}





</style>
