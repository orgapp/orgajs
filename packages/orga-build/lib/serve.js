import handler from 'serve-handler'
import http from 'http'

/**
 * @param {string} dir
 */
export function serve(dir, port = 3000) {
	/* @type {import('http').Server | null} */
	let server = null

	function start() {
		server = http
			.createServer((req, res) => {
				return handler(req, res, {
					public: dir,
				})
			})
			.listen(port)
		console.log(`Server running at http://localhost:${port}/`)
	}

	function stop() {
		server.close()
		server.on('close', () => {
			server = null
			return Promise.resolve()
		})
	}

	start()
	return { start, stop }
}
