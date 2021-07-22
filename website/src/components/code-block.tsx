import React, { createContext } from 'react'

export const CodeBlockContext = createContext({ inCodeBlock: false })

export default ({ children }) => {
  return (
    <CodeBlockContext.Provider value={{ inCodeBlock: true }}>
      {children}
    </CodeBlockContext.Provider>
  )
}
