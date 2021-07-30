import { NodePluginArgs } from 'gatsby'
import { slash } from 'gatsby-core-utils'
import { fluid, stats } from 'gatsby-plugin-sharp'
import { selectAll } from 'unist-util-select'
import _ from 'lodash'
import path from 'path'
import { Plugin, Transformer } from 'unified'
import u from 'unist-builder'

interface Options {
  gatsby: NodePluginArgs
}

const replace = (
  original: Record<string, unknown>,
  obj: Record<string, unknown>
) => {
  Object.keys(original).forEach((k) => delete original[k])
  Object.assign(original, obj)
  return original
}

const processImages: Plugin = ({ gatsby }: Partial<Options>) => {
  const { cache, getNodesByType, reporter } = gatsby

  const files = getNodesByType('File')

  const transformer: Transformer = async (tree, file) => {
    const dir = file.dirname
    const images = selectAll('[tagName=img]', tree)

    const promises = images.map(async (node) => {
      const src = node.properties['src']

      const imagePath = slash(path.join(dir, src))
      const imageNode = _.find(files, (file) => {
        if (file && file.absolutePath) {
          return file.absolutePath === imagePath
        }
        return null
      })
      if (!imageNode || !imageNode.absolutePath) return

      const maxWidth = node.properties['width']

      const fluidResult = await fluid({
        file: imageNode,
        args: {
          maxWidth,
        },
        reporter,
        cache,
      })

      let image = _.cloneDeep(node)
      _.assign(image.properties, {
        src: fluidResult.src,
        srcset: fluidResult.srcSet.replace(/\n/g, ''),
        alt: 'a picture',
        title: 'a title',
        loading: 'lazy',
        decoding: 'async',
        style: {
          width: '100%',
          height: '100%',
          margin: 0,
          verticalAlign: 'middle',
          position: 'absolute',
          top: 0,
          left: 0,
        },
      })

      const placeholderImageData = fluidResult.base64

      const ratio = `${(1 / fluidResult.aspectRatio) * 100}%`

      let removeBgImage = false

      const imageStats = await stats({ file: imageNode, reporter })
      if (imageStats && imageStats.isTransparent) removeBgImage = true

      // add placeholder
      image = u(
        'element',
        {
          tagName: 'span',
          properties: {
            style: {
              paddingBottom: ratio,
              position: 'relative',
              bottom: 0,
              left: 0,
              display: 'block',
              backgroundImage: removeBgImage
                ? undefined
                : `url('${placeholderImageData}')`,
              backgroundSize: removeBgImage ? undefined : 'cover',
            },
          },
        },
        [image]
      )

      // TODO: make this configurable
      image = u(
        'element',
        {
          tagName: 'a',
          properties: {
            href: fluidResult.src,
            target: '_blank',
            rel: 'noopener',
            style: {
              display: 'block',
            },
          },
        },
        [image]
      )

      const presentationWidth = fluidResult.presentationWidth

      const wrapper = u(
        'element',
        {
          tagName: 'span',
          properties: {
            style: {
              position: 'relative',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
              maxWidth: `${presentationWidth}px`,
            },
          },
        },
        [image]
      )

      replace(node, wrapper)
    })

    await Promise.all(promises)

    return tree
  }

  return transformer
}

export default processImages
