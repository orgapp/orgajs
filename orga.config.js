import tailwindcss from '@tailwindcss/vite'
export const preBuild = ['pnpm run build:css', 'pnpm run build:js']
export const containerClass = 'prose p-4'
export const vitePlugins = [tailwindcss()]
export const root = 'docs'
