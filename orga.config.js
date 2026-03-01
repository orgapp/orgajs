import tailwindcss from '@tailwindcss/vite'
import rehypePrettyCode from 'rehype-pretty-code'

export const containerClass = 'prose p-4'
export const styles = ['docs/style.css']
export const vitePlugins = [tailwindcss()]
export const rehypePlugins = [[rehypePrettyCode, { theme: 'github-dark' }]]
export const root = 'docs'
export const exclude = ['config.d.ts']
