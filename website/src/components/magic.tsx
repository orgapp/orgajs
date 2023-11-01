import { useState, type ReactNode, useEffect } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

interface TabView {
  tab: string
  view: ReactNode
}

const bp = 1024

const getTabClasses = (selected: boolean, ...extra: string[]) => {
  const classes = [
    'px-2 py-1 min-w-[80px]',
    'cursor-pointer',
    'overflow-hidden',
    'outline-none',
    'text-center',
    'border-x border-t border-slate-400',
    ...extra,
  ]
  if (selected) {
    classes.push('bg-white text-blue-600 font-bold')
  } else {
    classes.push('text-slate-600 hover:bg-zinc-100')
  }
  return classes.join(' ')
}

export default function Magic({
  children,
  tabs,
}: {
  tabs: TabView[]
  children: ReactNode
}) {
  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    const vw = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    )
    if (vw >= bp) {
      setTabIndex(1)
    }
  }, [])

  return (
    <Tabs
      className="grid grid-cols-1 lg:grid-cols-2 grid-rows-[auto_1fr] h-full w-full"
      selectedIndex={tabIndex}
      onSelect={(index) => setTabIndex(index)}
    >
      <div className="col-span-2 flex flex-wrap justify-end items-end bg-gray-200 pt-2 border-b border-t border-slate-400">
        <TabList className="flex">
          <Tab className={getTabClasses(tabIndex === 0, 'lg:hidden')}>code</Tab>
          {tabs.map((tab, i) => (
            <Tab
              key={`t-${tab.tab}`}
              className={getTabClasses(tabIndex === i + 1)}
            >
              {tab.tab}
            </Tab>
          ))}
        </TabList>
      </div>
      <TabPanel
        forceRender={true}
        className={`overflow-auto lg:block ${tabIndex === 0 ? '' : 'hidden'}`}
      >
        {children}
      </TabPanel>
      <div className="overflow-auto border-l border-stone-300">
        {tabIndex === 0 && (
          <div className="hidden lg:flex justify-center items-center bg-zinc-200 text-zinc-400 h-full">
            Select view to see more.
          </div>
        )}
        {tabs.map((tab) => (
          <TabPanel key={`tp-${tab.tab}`}>
            <div className="p-4">{tab.view}</div>
          </TabPanel>
        ))}
      </div>
    </Tabs>
  )
}
