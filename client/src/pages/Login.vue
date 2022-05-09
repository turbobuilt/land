<template>
     <div class="login-page">
        <form class="login-form" @submit.prevent="login">
            <div class="login-inputs-container">
                <v-text-field :hide-details="true" v-model="email" label="Email" />
                <v-text-field type="password" v-model="password" label="Password"  hide-details="auto" @keypress.enter="login"/>
            </div>
            <div class="login-error" v-if="error">{{error}}</div>
            <br>
            <div class="login-buttons">
                <v-btn color="" @click="login">{{ loading ? "Working..." : "Login" }}</v-btn>
                <v-btn color="" @click="sendResetPasswordEmail">{{ loading ? "Working..." : "Forgot Password" }}</v-btn>
                <v-btn color="" @click="createAccount">{{ loading ? "Working..." : "Create Account" }}</v-btn>
            </div>
        </form>
        <img class="login-image" src="/img/unlock.jpg" />
    </div>
</template>
<script lang="ts">
import {Vue, Options} from "vue-class-component"
import axios from "axios";
import * as alertify from "alertify-galvanize";
import { handleHttpError } from "../lib/errors";
import { store } from "../store";

const loginUrl = "";

@Options({})
export default class LoginPage extends Vue {
    email: string = "";
    password: string = "";
    loading = false;
    error = "";

    async login() {
        if (this.loading)
            return;
        try {
            this.loading = true;
            this.error = "";
            var res = await axios.post(`${loginUrl}/api/login`, {
                email: this.email,
                password: this.password
            });
            Object.assign(store, res.data);
        } catch (err) {
            handleHttpError(err, "logging in");
        } finally {
            this.loading = false;
        }
    }

    async sendResetPasswordEmail() {
        if (this.loading)
            return;
        try {
            this.loading = true;
            this.error = "";
            var res = await axios.post(`${loginUrl}/api/request-password-reset`, {
                email: this.email
            });
            var data = res.data;
            if (data.error) {
                this.error = data.error;
                return;
            } else {
                this.error = "";
            }
        } catch (err) {
            handleHttpError(err, "sending password reset email")
        } finally {
            this.loading = false;
        }
    }

    async createAccount() {
        if (this.loading)
            return;
        try {
            this.loading = true;
            this.error = "";
            var res = await axios.post(`${loginUrl}/api/user`, {
                email: this.email,
                password: this.password
            });
            Object.assign(store, res.data);
            alertify.success("Account created");
        } catch (err) {
            handleHttpError(err, "creating your account")
        } finally {
            this.loading = false;
        }
    }
}
</script>
<style lang="scss">
.login-page {
    display: flex;
    flex-direction: column;
    .login-form {
        padding: 5px;
        flex-grow: 0;
        // max-width: 500px;
    }
    .login-inputs-container {
        display: flex; 
        flex-wrap:wrap;
        > div {
            min-width: 250px;
        }
    }
    .login-buttons {
        display:flex; 
        justify-content: space-between;
        flex-wrap: wrap;
        > button{
            margin: 5px;
        }
    }
    .login-image {
        flex-grow: 1;
    }
}
</style>
