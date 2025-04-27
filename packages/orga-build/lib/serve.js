import express from 'express'
import { createServer } from 'vite'
import fs from 'fs/promises'
import orga from '@orgajs/rollup'
import react from '@vitejs/plugin-react'
import { pluginFactory } from './vite/plugin.js'

/**
 * @param {import('./config.js').Config} config
 * @param {number} [port]
 */
export async function serve(config, port = 3000) {
	const app = express()
	const vite = await createServer({
		root: process.cwd(),
		plugins: [orga(), react(), pluginFactory(), ...config.vitePlugins],
		server: { middlewareMode: true },
		appType: 'custom'
	})

	app.use(vite.middlewares)
	app.use(/(.*)/, async (req, res) => {
		const url = req.originalUrl

		// read index.html file from path relative to this file
		const indexPath = new URL('./vite/index.html', import.meta.url).pathname
		let template = await fs.readFile(indexPath, { encoding: 'utf-8' })
		template = await vite.transformIndexHtml(url, template)

		console.log('url:', url)
		const html = template
		res.status(200).setHeader('Content-Type', 'text/html').end(html)
	})

	app.listen(port)
}
