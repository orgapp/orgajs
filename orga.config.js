import tailwindcss from '@tailwindcss/vite'
export const preBuild = ['pnpm run build:css', 'pnpm run build:js']
export const vite = { plugins: [tailwindcss()] }
export const root = 'docs'
