import { createBuilder } from 'vite'
import { alias, createOrgaBuildConfig } from './plugin.js'

// Re-export alias for backwards compatibility
export { alias }

/**
 * Build the site into `outDir`. The work happens in Vite's `buildApp`, see
 * `prerenderPlugin`.
 *
 * @param {import('./config.js').Config} config
 * @param {string} [projectRoot]
 */
export async function build(
	{
		outDir,
		root,
		containerClass,
		styles = [],
		rehypePlugins = [],
		vitePlugins = [],
		exclude = [],
		site
	},
	projectRoot = process.cwd()
) {
	const { plugins } = createOrgaBuildConfig({
		root,
		outDir,
		containerClass,
		styles,
		rehypePlugins,
		vitePlugins,
		exclude,
		site
	})

	const builder = await createBuilder({ root: projectRoot, plugins })
	await builder.buildApp()
}
