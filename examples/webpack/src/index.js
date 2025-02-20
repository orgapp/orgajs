import React from 'react'
import { createRoot } from 'react-dom/client'
import Hello from './hello.org'

const root = createRoot(document.getElementById('root'))
root.render(<Hello />)
