import React, { useState } from 'react'

function Tabs({ children, theme, defaultTab = undefined, style }) {

  const tabs = children.map(c => c.props.label)
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0])
  const child = children.filter(c => c.props.label === activeTab)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      ...style
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: theme.background,
        borderBottom: `1px solid ${theme.border}`,
        paddingTop: '0.2em',
      }}>
        {tabs.map(tab =>
          <button
            key={`tab-${tab}`}
            style={{
              display: 'inline-block',
              marginBottom: `-1px`,
              backgroundColor: theme.background,
              color: theme.lightText,
              cursor: 'pointer',
              border: `solid ${theme.border}`,
              borderWidth: '0px 0px 1px 0px',
              padding: '0.5rem 0.75rem',
              ...activeTab === tab && {
                backgroundColor: theme.surface,
                color: theme.text,
                border: `solid ${theme.border}`,
                borderWidth: '1px 1px 0 1px',
              }
            }}
            onClick={() => setActiveTab(tab)}
          >{tab}</button>)}
      </div>
      <div style={{overflow: 'auto', height: '100%', padding: '0.4em 0.8em'}}>
        {child}
      </div>
    </div>
  )
}

export default Tabs
