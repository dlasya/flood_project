import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function createPageUrl(page) {
  return `/${page}`;
}

export const isIframe = typeof window !== 'undefined' && window.self !== window.top;
