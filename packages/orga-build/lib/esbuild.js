import assert from 'assert'
import * as esbuild from 'esbuild'
import esbuildOrga from '@orgajs/esbuild'

/**
 * Evaluate an org/jsx/tsx/ts file. Returns as a module.
 * It's like a dynamic import, but without relying on nodejs.
 * @param {string} filePath
 * @returns {Promise<any>}
 */
export async function evaluate(filePath) {
	const result = await esbuild.build({
		entryPoints: [filePath],
		bundle: true,
		format: 'esm',
		platform: 'node',
		target: 'esnext',
		jsx: 'automatic',
		write: false,
		plugins: [esbuildOrga()],
		loader: {
			'.jsx': 'jsx',
			'.tsx': 'tsx'
		}
	})

	const files = result.outputFiles
	assert(files.length === 1, 'Expected only one output file')
	const code = files[0].text
	return await new Function(
		`return import("data:application/javascript,${encodeURIComponent(code)}")`
	)()
}

/**
 * @param {string} pattern
 */
export async function build(pattern) {
	return await esbuild.build({
		entryPoints: [pattern],
		entryNames: '[dir]/_/[name]',
		bundle: true,
		format: 'esm',
		platform: 'node',
		target: 'esnext',
		jsx: 'automatic',
		// write: false,
		outdir: '.build',
		plugins: [esbuildOrga()],
		loader: {
			'.jsx': 'jsx',
			'.tsx': 'tsx'
		}
	})
}

export async function b() {}
