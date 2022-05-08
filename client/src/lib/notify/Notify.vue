<template>
    <div class="w-app">
        <w-dialog title-class="primary-light1--bg white notify-dialog" @close="localOnClose" v-model="open">
            <template #title>
                
            </template>

            <div v-html="message">
                
            </div>

            <template #actions>
                <w-button @click="close">Close</w-button>
            </template>
        </w-dialog>
    </div>
</template>
<script lang="ts">import { defineComponent } from "@vue/runtime-core"


export default defineComponent({
    props: ["data","message","onClose"],
    data() {
        return {
            open: true
        }
    },
    methods: {
        close(){
            this.open = false
            this.localOnClose();
        },
        localOnClose(){
            if(this.onClose) {
                this.onClose();
            }
        }
    }
})
</script>
<style lang="scss">
html .w-overlay.w-dialog.absolute {
    bottom: unset;
}
html body .w-dialog .w-card {
    max-width: 94%;
    // max-height: 94%;
    max-height: none;
    width: 600px;
    flex-grow: 0;
}
</style>