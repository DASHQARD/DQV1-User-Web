import React from 'react'

import { Tabs } from '@/components'
import { useUrlState } from '@/hooks'

interface TabConfig<T extends string> {
  key: T
  component: React.ComponentType<any>
  label?: string // Optional custom label, falls back to key
}

interface TabbedViewProps<T extends string> {
  tabs: TabConfig<T>[]
  defaultTab: T
  urlParam?: string // URL parameter name, defaults to 'tab'
  tabsClassName?: string
  btnClassName?: string
  containerClassName?: string
}

export function TabbedView<T extends string>({
  tabs,
  defaultTab,
  urlParam = 'tab',
  tabsClassName = 'gap-6',
  btnClassName = 'pb-2',
  containerClassName = 'space-y-4',
}: Readonly<TabbedViewProps<T>>) {
  const [currentTab, setCurrentTab] = useUrlState(urlParam, defaultTab)

  // Create a map of tab keys to components
  const tabComponentMap = tabs.reduce(
    (acc, tab) => ({ ...acc, [tab.key]: tab.component }),
    {} as Record<T, React.ComponentType<any>>,
  )

  // Get the active component
  const ActiveComponent = tabComponentMap[currentTab as T]

  // Create tab options for the Tabs component
  const tabOptions = tabs.map((tab) => ({
    value: tab.key,
    label: tab.label || tab.key,
  }))

  if (!ActiveComponent) {
    console.warn(`No component found for tab: ${currentTab}`)
    return null
  }

  return (
    <div className={containerClassName}>
      <Tabs
        tabs={tabOptions}
        active={currentTab}
        setActive={setCurrentTab}
        btnClass={btnClassName}
        className={tabsClassName}
      />
      {ActiveComponent ? React.createElement(ActiveComponent) : null}
    </div>
  )
}
