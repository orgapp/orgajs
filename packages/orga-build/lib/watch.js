import fs from 'node:fs/promises'

/**
 * @param {import("fs").PathLike} dir
 * @param {RegExp} ignore
 * @param {{(event: fs.FileChangeInfo<string>): Promise<void> | void}} onChange
 */
export async function watch(dir, ignore, onChange) {
	let busy = false
	let dirty = false
	/** @type {ReturnType<typeof setTimeout> | null} */
	let timeout = null
	const delay = 1000
	const defaultIgnorePattern = /node_modules|\.git|\.DS_Store|\.orga-build/

	const watcher = fs.watch(dir, { recursive: true })
	for await (const event of watcher) {
		if (
			event.eventType !== 'change' ||
			event.filename === null ||
			shouldIgnore(event.filename)
		) {
			continue
		}
		console.log(`file changed: ${event.filename}`)
		dirty = true
		if (busy) {
			continue
		}
		if (timeout !== null) clearTimeout(timeout)
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

	/**
	 * @param {string} filename
	 */
	function shouldIgnore(filename) {
		return defaultIgnorePattern.test(filename) || ignore.test(filename)
	}
}
