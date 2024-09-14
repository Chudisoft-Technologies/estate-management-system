declare module "toastify-js" {
  interface ToastifyOptions {
    text?: string;
    duration?: number;
    close?: boolean;
    gravity?: "top" | "bottom";
    position?: "left" | "center" | "right";
    backgroundColor?: string;
    stopOnFocus?: boolean;
    onClick?: () => void;
    className?: string;
  }

  class Toastify {
    constructor(options: ToastifyOptions);
    showToast(): void;
  }

  export default Toastify;
}
