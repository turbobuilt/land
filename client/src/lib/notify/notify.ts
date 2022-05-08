import WaveUI from 'wave-ui';
import { createApp } from "vue";
import Notify from "./Notify.vue";
// import { WApp, WButton } from 'wave-ui/src/wave-ui/components'


export function notify(message: string, onClose?: Function, data?: any){
    let node = document.createElement("div");
    const notify = createApp(Notify, { 
        message, 
        data,
        onClose:() => {
            notify.unmount();
            document.body.removeChild(node);
            if(onClose)
                onClose();
        }
    });
    var ui = new WaveUI(notify);
    WaveUI.install(notify);
    document.body.appendChild(node);
    notify.mount(node);
}

export function verify(message: string, onConfirm?: Function, onClose?: Function, data?: any){
    let node = document.createElement("div");
    const notify = createApp(Notify, { 
        message, 
        data,
        onClose:() => {
            notify.unmount();
            document.body.removeChild(node);
            if(onClose)
                onClose();
        },
        onConfirm:() => {
            notify.unmount();
            document.body.removeChild(node);
            if(onConfirm)
                onConfirm();
        }
    });
    var ui = new WaveUI(notify);
    WaveUI.install(notify);
    document.body.appendChild(node);
    notify.mount(node);
}