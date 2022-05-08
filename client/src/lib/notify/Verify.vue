<template>
    <div class="w-app">
        <w-dialog title-class="primary-light1--bg white notify-dialog" @close="localOnClose" v-model="open">
            <template #title>
                
            </template>

            <div v-html="message">
                
            </div>

            <template #actions>
                <div style="display:flex;justify-content:space-between;">
                    <w-button @click="close(true)">Yes</w-button>
                    <w-button @click="close(false)">No</w-button>
                </div>
            </template>
        </w-dialog>
    </div>
</template>
<script lang="ts">import { defineComponent } from "@vue/runtime-core"


export default defineComponent({
    props: ["data","message","onClose","onConfirm"],
    data() {
        return {
            open: true
        }
    },
    methods: {
        close(confirmed){
            this.open = false
            this.localOnClose(confirmed);
        },
        localOnClose(confirmed){
            if(confirmed) {
                if(this.onConfirm) 
                    this.onConfirm();
            } else {
                if(this.onClose) {
                    this.onClose();
                }
            }
        }
    }
})
</script>
<style lang="scss">
</style>