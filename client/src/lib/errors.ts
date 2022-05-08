import { notify } from "./notify/notify";

export function handleHttpError(err: any, message = "loading") {
    console.error(err, err.response);
    if(err?.response?.data?.error) {
        notify(`Error ${message}: ${err.response.data.error}`);
    } else {
        notify(`There was a weird error ${message}.  This is all the information about it: ${err?.message}`)
    }
}