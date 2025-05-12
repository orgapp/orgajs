import { hydrateRoot } from 'react-dom/client'
import { Router } from 'wouter'
import { App } from './app.jsx'

const ssr = window._ssr

hydrateRoot(
	document.getElementById('root'),
	<Router>
		<App />
	</Router>
)
