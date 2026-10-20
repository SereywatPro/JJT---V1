declare module 'vue-hot-toast' {
  import type { Component } from 'vue'

  export interface ToasterProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    duration?: number
    reverseOrder?: boolean
  }

  export const Toaster: Component
  export const toast: {
    (message: string): string
    success(message: string, options?: object): string
    error(message: string, options?: object): string
    loading(message: string, options?: object): string
    dismiss(id?: string): void
  }
}
