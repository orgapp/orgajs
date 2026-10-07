import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * A site with a `'use client'` component used from org pages: `/` hydrates it
 * on load, `/docs` when visible (plus a `memo()` export), and `/plain` has no
 * island. `/page` is a whole-page island.
 * @param {string} dir
 */
export async function writeIslandFixture(dir) {
	await fs.mkdir(path.join(dir, 'docs'), { recursive: true })
	await fs.writeFile(
		path.join(dir, '_components.tsx'),
		`'use client'
import { memo, useId } from 'react'
import { useCounter } from './_hooks'

export function Counter({ start }: { start: number }) {
	const [count, setCount] = useCounter(start)
	return (
		<button id={useId()} onClick={() => setCount(count + 1)}>
			{count}
		</button>
	)
}

export const MemoCounter = memo(Counter)
`
	)
	await fs.writeFile(
		path.join(dir, 'index.org'),
		'#+title: Home\n\n#+jsx: <Counter start={1} />\n'
	)
	await fs.writeFile(
		path.join(dir, 'docs', 'index.org'),
		'#+title: Docs\n\n#+jsx: <Counter start={2} client="visible" />\n\n#+jsx: <MemoCounter start={3} meta={{ children: ["a"], skipped: undefined }} />\n\n[[../pic.png]]\n'
	)
	// Larger than Vite's inline limit, so it is emitted as a file.
	await fs.writeFile(path.join(dir, 'pic.png'), Buffer.alloc(8192, 1))
	// A hook imported from one 'use client' module into another must stay a hook.
	await fs.writeFile(
		path.join(dir, '_hooks.tsx'),
		`'use client'
import { useState } from 'react'

export function useCounter(start: number) {
	return useState(start)
}
`
	)
	await fs.writeFile(path.join(dir, 'plain.org'), '#+title: Plain\n\nText.\n')
	await fs.writeFile(
		path.join(dir, 'page.tsx'),
		`'use client'
export const title = 'Page'
export default function Page() {
	return <button onClick={() => alert('hi')}>page</button>
}
`
	)
}
