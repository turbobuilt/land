
declare module 'alertify-galvanize' {
    function error(message: string, type?: string, timeout?: number): void;
    function success(message: string, type?: string, timeout?: number): void;
    function alert(message: string, type?: string, timeout?: number): void;
}