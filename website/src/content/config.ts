// there's an issue with eslint + astro:content
// eslint-disable-next-line import/no-unresolved
import { z, defineCollection } from 'astro:content'
const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
})
export const collections = {
  docs,
}
