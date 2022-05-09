import * as alertify from "alertify-galvanize";


export function handleHttpError(err: any, message = "loading") {
    console.error(err, err.response);
    if(err?.response?.data?.error) {
        alertify.alert(`Error ${message}: ${err.response.data.error}`);
    } else {
        alertify.alert(`There was a weird error ${message}.  This is all the information about it: ${err?.message}`)
    }
}