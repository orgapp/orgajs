import fs from 'node:fs/promises'

/**
 * @param {import("fs").PathLike} dir
 * @param {RegExp} ignore
 * @param {{(event: fs.FileChangeInfo<string>): Promise<void> | void}} onChange
 */
export async function watch(dir, ignore, onChange) {
	let busy = false
	let dirty = false
	let timeout = null
	const delay = 1000
	const defaultIgnorePattern = /node_modules|\.git|\.DS_Store/

	const watcher = fs.watch(dir, { recursive: true })
	for await (const event of watcher) {
		if (event.eventType !== 'change' || shouldIgnore(event.filename)) {
			continue
		}
		console.log(`file changed: ${event.filename}`)
		dirty = true
		if (busy) {
			continue
		}
		clearTimeout(timeout)
		timeout = setTimeout(processEvent, delay, event)
	}

	/**
	 * @param {any} event
	 */
	async function processEvent(event) {
		busy = true
		dirty = false
		await onChange(event)
		busy = false
		if (dirty) {
			processEvent(event)
		}
	}

	function shouldIgnore(filename) {
		return defaultIgnorePattern.test(filename) || ignore.test(filename)
	}
}
