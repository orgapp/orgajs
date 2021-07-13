import DataLoader from 'dataloader'
import { cloneDeep } from 'lodash'
import PQueue from 'p-queue'
import * as path from 'path'
import webpack from 'webpack'

const queue = new PQueue({
  concurrency: 4,
})

function orgaHTMLLoader({ cache, reporter, store }) {

  return new DataLoader(
    async keys => {
      const webpackConfig = cloneDeep(store.getState().webpack)
      const outputPath = path.join(cache.directory, `webpack`)
      // something sets externals, which will cause React to be undefined
      webpackConfig.externals = undefined
      webpackConfig.entry = require.resolve(`./wrap-root-render-html-entry.js`)
      // webpackConfig.entry = `./wrap-root-render-html-entry.js`
      webpackConfig.output = {
        filename: `jojo.js`,
        path: outputPath,
        libraryTarget: `commonjs`,
      }
      webpackConfig.plugins = webpackConfig.plugins || []
      webpackConfig.externalsPresets = {
        node: true,
      }
      const compiler = webpack(webpackConfig)

      return queue.add(
        () =>
          new Promise(resolve => {
            console.log(`>>>>>> trying to run webpack compiler`)
            compiler.run((err, stats) => {
              // error handling bonanza
              if (err) {
                reporter.error(err.stack || err)
                // @ts-ignore
                if (err.details) {
                  // @ts-ignore
                  reporter.error(`gatsby-plugin-orga\n ${JSON.stringify(err.details)}`)
                }
                return
              }

              const info = stats.toJson()

              if (stats.hasErrors()) {
                reporter.error(`gatsby-plugin-orga\n ${JSON.stringify(info.errors)}`)
              }

              if (stats.hasWarnings()) {
                reporter.warn(`gatsby-plugin-orga\n` + info.warnings)
              }

              console.log({ info })


              const renderOrgaBody = require(path.join(outputPath, `jojo.js`)).default

              resolve(
                keys.map(({ body }) => renderOrgaBody(body))
              )
            })
          })
      )
    },
    { cacheKeyFn: ({ id }) => id }
  )


}

export default orgaHTMLLoader
