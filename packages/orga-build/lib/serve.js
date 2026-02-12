import express from 'express'
import { createServer } from 'vite'
import fs from 'node:fs/promises'
import react from '@vitejs/plugin-react'
import { pluginFactory } from './vite.js'
import { alias } from './build.js'
import { setupOrga } from './orga.js'

/**
 * @param {import('./config.js').Config} config
 * @param {number} [port]
 */
export async function serve(config, port = 3000) {
	const app = express()
	const vite = await createServer({
		plugins: [
			setupOrga({ containerClass: config.containerClass }),
			react(),
			pluginFactory({ dir: config.root }),
			...config.vitePlugins
		],
		server: { middlewareMode: true },
		appType: 'custom',
		resolve: {
			alias: alias
		}
	})

	app.use(vite.middlewares)
	app.get('/favicon.ico', (req, res) => {
		res.status(404).end()
	})

	app.use(async (req, res, next) => {
		const url = req.originalUrl
		if (req.method !== 'GET' || !req.headers.accept?.includes('text/html')) {
			return next()
		}

		try {
			// read index.html file from path relative to this file
			const indexPath = new URL('./index.html', import.meta.url).pathname
			let template = await fs.readFile(indexPath, { encoding: 'utf-8' })
			template = await vite.transformIndexHtml(url, template)
			const html = template
			res.status(200).setHeader('Content-Type', 'text/html').end(html)
		} catch (/** @type{any} */ e) {
			next(e)
		}
	})

	app.listen(port, () => {
		console.log(`  Server running at http://localhost:${port}/`)
	})
}
