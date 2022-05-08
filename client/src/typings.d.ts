

declare module 'wave-ui' {
    export default class WaveUI {
        constructor(app: any, options?: any);

        static install: (app: any ) => any;

        static instance: {
            notify: (message: string, type?: string, timeout?: number) => void
        }
    }
}