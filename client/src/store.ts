import { reactive } from "vue";
import axios from "axios";
import { handleHttpError } from "./lib/errors";


export const store = reactive({
    token: null as { token: string, tokenExpires: number },
    user: null as any,
    requestedRoute: null as string
});


async function getProfileInfo() {
    
}


console.log((window as any).iosAppOptions, "were options")


