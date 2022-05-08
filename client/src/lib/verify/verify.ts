import WaveUI from 'wave-ui';
import { createApp } from "vue";
import Notify from "./Verify.vue";
// import { WApp, WButton } from 'wave-ui/src/wave-ui/components'


export function verify(message: string, onConfirm?: Function, onCancel?: Function, data = {
    confirmMessage: "Yes"
}){
    let node = document.createElement("div");
    const notify = createApp(Notify, { 
        message, 
        onClose:() => {
            notify.unmount();
            document.body.removeChild(node);
        },
        onConfirm,
        onCancel,
        confirmMessage: data ? data.confirmMessage : "Yes",
    });
    var ui = new WaveUI(notify);
    WaveUI.install(notify);
    document.body.appendChild(node);
    notify.mount(node);
}