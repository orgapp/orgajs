import * as _ from 'lodash/fp'
import {
  Headline, Parent, parse,
  ParseOptions, parseTimestamp,
  Section, Document,
} from 'orga'
import highlight from 'rehype-highlight'
import html from 'rehype-stringify'
import reorg2rehype from 'reorg-rehype'
import unified from 'unified'
import { select, selectAll } from 'unist-util-select'
import { inlineFootnotes, leveling, processFootnotes } from './plugins'

interface Metadata {
  title: string;
  category: string;
  export_file_name: string;
  keyword: string;
  tags: string[];
  date?: Date;
}

const defaultToHtmlOptions = {
  transform: (tree: Parent): void => {}
}

export interface Post extends Metadata {
  ast?: Parent;
  html: (options: typeof defaultToHtmlOptions) => Promise<string>;
}

interface Options extends ParseOptions {
  filename: string;
  keywords: string[];
}

interface BuildProps {
  text: string;
  filename: string;
  transform?: (tree: Parent) => void;
  options?: Partial<ParseOptions>;
}

const sanitise = (title: string) => {
  return title.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase()
}


const extractMetadata = (tree: Section | Document, fallbacks: Partial<Metadata> = {}): Metadata => {

  const getTitle = (metadata: any) => {
    const { title, export_title, ...rest } = metadata
    let theTitle = export_title || title
    if (tree.type === 'section') {
      const headline = select('headline', tree) as Headline
      theTitle = headline.content
    }

    return {
      ...rest,
      title: theTitle || 'Untitled',
    }

  }

  const getDate = (metadata: any) => {
    const {
      date, export_date, publish_date,
      ...rest
    } = metadata

    let timestamp = parseTimestamp(date) ||
      parseTimestamp(export_date) ||
      parseTimestamp(publish_date)

    if (!timestamp && tree.type === 'section') {
      timestamp = _.get('timestamp')(select(`planning[keyword=CLOSED]`, tree))
    }

    return {
      ...rest,
      date: _.get('date')(timestamp),
    }
  }

  const getTags = (metadata: Metadata) => {
    let tags: string[] = []
    if (tree.type === 'section') {
      const headline = select('headline', tree) as Headline
      tags = headline.tags || tags
    }

    return {
      ...metadata,
      tags,
    }
  }

  const getKeyword = (metadata: Metadata) => {
    if (tree.type === 'section') {
      const headline = select('headline', tree) as Headline
      return { ...metadata, keyword: headline.keyword }
    }
    return metadata
  }

  const getExportFileName = (metadata: Metadata) => {
    if (metadata.export_file_name) return metadata
    return {
      ...metadata,
      export_file_name: sanitise(metadata.title)
    }
  }

  return _.flow(
    getTitle,
    getDate,
    getTags,
    getExportFileName,
    getKeyword,
  )({ ...fallbacks, ...tree.properties })
}

export const build = async ({ text, filename, options }: BuildProps) => {
  const ast = parse(text, options)
  const category = ast.properties['category'] || filename || ''

  const keywords = (ast.properties.orga_publish_keyword || '').split(' ').map(k => k.trim()).filter(k => k.length > 0)

  // section
  if (keywords.length > 0) {
    const sections = selectAll('section', ast)
      .filter((s: Section) => {
        const headline = select('headline', s) as Headline
        return keywords.includes(headline.keyword)
      })
      .map(async (section: Section) => {
        return {
          ...extractMetadata(section, { category }),
          ast: section,
        }
      })
    return await Promise.all(sections)
  }

  // document
  return [{
    ...extractMetadata(ast, { export_file_name: filename }),
    ast,
  }]
}

export const toHtml = async (tree: Parent, options = defaultToHtmlOptions) => {
  const { transform } = { ...defaultToHtmlOptions, ...options }
  const processor = unified()
    .use(leveling, { base: _.get('level')(tree) || 0 })
    .use(inlineFootnotes)
    .use(() => transform)
    .use(reorg2rehype, { highlight: false })
    .use(processFootnotes)
    .use(highlight, { ignoreMissing: true })
    .use(html, { allowDangerousHtml: true })
  const hast = await processor.run(tree)
  return processor.stringify(hast)
}
