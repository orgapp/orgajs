import { defineConfig } from 'astro/config'
import orga from '@orgajs/astro'
import react from '@astrojs/react'
import rehypeKatex from 'rehype-katex'
import tailwind from '@astrojs/tailwind'

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    orga({
      rehypePlugins: [rehypeKatex],
    }),
    tailwind(),
  ],
})
