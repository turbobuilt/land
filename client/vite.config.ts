import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            '/api': {
                target: "http://127.0.0.1:5070"
            }
        },
        // https: true
    },
    build: {
        rollupOptions: {
            makeAbsoluteExternalsRelative: true
        },
    },
    css: {
        preprocessorOptions: {
            scss: { 
                additionalData: `@import "./src/main.scss";` 
            },
        },
    },
})
