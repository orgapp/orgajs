// eslint-disable-next-line
import { getCollection } from 'astro:content'

type DocLink = {
  title: string
  slug: string
  indent: number
}

export async function getDocLinks(): Promise<DocLink> {
  const docs = await getCollection('docs')
  return docs
    .map((doc) => {
      const indent = doc.slug.split('/').length - 1
      return {
        title: doc.data.title,
        slug: doc.slug,
        position: doc.data.position,
        indent,
      }
    })
    .sort((a, b) => {
      return a.position - b.position
    })
}
