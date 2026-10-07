import { createRoot, hydrateRoot } from 'react-dom/client'
import { Router } from 'wouter'
import { App } from './app.jsx'

const container = document.getElementById('root')
const app = (
	<Router>
		<App />
	</Router>
)

// Pages rendered by the server (build or dev) set `window._ssr`: hydrate the
// existing markup instead of discarding it and rendering from scratch.
if (window._ssr && container.hasChildNodes()) {
	hydrateRoot(container, app)
} else {
	createRoot(container).render(app)
}
