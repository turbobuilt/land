<template>
    <div class="w-app verify-modal">
        <w-dialog title-class="primary-light1--bg white" @close="localOnClose" v-model="open">
            <template #title>
                
            </template>

            <div v-html="message">
                
            </div>

            <template #actions>
                <div style="display:flex;justify-content:space-between;width: 100%;">
                    <w-button @click="cancelClicked">Cancel</w-button>
                    <w-button class="ok-button" @click="okClicked">{{confirmMessage || "Yes"}}</w-button>
                </div>
            </template>
        </w-dialog>
    </div>
</template>
<script lang="ts">import { defineComponent } from "@vue/runtime-core"


export default defineComponent({
    props: ["data","message","onClose","onCancel","onConfirm","confirmMessage"],
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
        },
        okClicked(){
            this.close();
            if(this.onConfirm)
                this.onConfirm();
        },
        cancelClicked(){
            this.close();
            if(this.onCancel)
                this.onCancel();
        }
    }
})
</script>
<style lang="scss">
.verify-modal {
    .ok-button {
        margin-left: 15px;
    }
}
</style>