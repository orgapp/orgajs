declare module 'orga-build:content' {
	export interface ContentEntry {
		id: string
		slug: string
		path: string
		filePath: string
		ext: 'org' | 'tsx' | 'jsx'
		data: Record<string, unknown>
	}

	/**
	 * Get all content entries matching a path pattern
	 * @param path - Optional path prefix to filter by (e.g., 'writing', 'content/writing/2025')
	 * @param filter - Optional filter function to further refine results
	 * @returns Array of matching content entries
	 */
	export function getPages(
		path?: string,
		filter?: (entry: ContentEntry) => boolean
	): ContentEntry[]

	/**
	 * Get a single content entry by id or slug
	 * @param idOrSlug - The id or slug of the entry to find
	 * @param path - Optional path prefix to search within
	 * @returns The matching content entry or undefined
	 */
	export function getPage(
		idOrSlug: string,
		path?: string
	): ContentEntry | undefined

	/**
	 * Get multiple content entries by reference
	 * @param refs - Array of references with id and optional path
	 * @returns Array of matching content entries (may include undefined)
	 */
	export function getEntries(
		refs: Array<{ path?: string; id: string }>
	): Array<ContentEntry | undefined>

	/**
	 * Alias for getPages
	 */
	export const getCollection: typeof getPages

	/**
	 * Alias for getPage
	 */
	export const getEntry: typeof getPage
}
