import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import { BrowserRouter } from 'react-router'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
	<BrowserRouter basename="/">
		<App />
	</BrowserRouter>
)
