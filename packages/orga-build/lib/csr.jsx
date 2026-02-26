import { createRoot } from 'react-dom/client'
import { Router } from 'wouter'
import { App } from './app.jsx'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
	<Router>
		<App />
	</Router>
)
