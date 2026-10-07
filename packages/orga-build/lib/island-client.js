/**
 * Hydrates every `<orga-island>` on the page: imports the module the server
 * referenced and mounts React on the server-rendered markup. React itself is
 * only loaded once an island hydrates, so `client="visible"` islands below the
 * fold cost nothing until scrolled into view.
 */
for (const el of Array.from(document.querySelectorAll('orga-island'))) {
	// The island has `display: contents` and no box of its own, so visibility
	// is watched on its children; a text-only island has none and hydrates now.
	if (el.getAttribute('client') !== 'visible' || !el.children.length) {
		hydrate(el)
		continue
	}
	const observer = new IntersectionObserver((entries) => {
		if (!entries.some((entry) => entry.isIntersecting)) return
		observer.disconnect()
		hydrate(el)
	})
	for (const child of Array.from(el.children)) observer.observe(child)
}

/**
 * @param {Element} el
 */
async function hydrate(el) {
	const [{ createElement }, { hydrateRoot }, mod] = await Promise.all([
		import('react'),
		import('react-dom/client'),
		import(
			/* @vite-ignore */
			new URL(/** @type {string} */ (el.getAttribute('src')), document.baseURI)
				.href
		)
	])
	const Component = mod[/** @type {string} */ (el.getAttribute('export'))]
	const props = JSON.parse(el.getAttribute('props') || '{}')
	hydrateRoot(el, createElement(Component, props), {
		// Same prefix the server rendered this island with, so `useId` matches.
		identifierPrefix: el.getAttribute('prefix') || ''
	})
}
