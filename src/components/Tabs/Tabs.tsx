'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/libs'

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-black dark:data-[state=active]:text-white px-4 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-8 rounded-full flex-1 items-center justify-center gap-1.5 border border-transparent py-1 text-sm font-bold whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
        <path
          d="M3.333 11.767v.9m0 0v.9m0-.9h.9m-.9 0h-.9M8.6 2c.427 3.358 1.754 5.428 5.4 6-3.46.543-4.953 2.485-5.4 6-.447-3.515-1.94-5.457-5.4-6 3.46-.543 4.953-2.485 5.4-6zM2.8 1c.165 1.004.768 1.63 1.8 1.8-1.032.17-1.635.796-1.8 1.8-.165-1.004-.768-1.63-1.8-1.8 1.004-.165 1.63-.768 1.8-1.8z"
          fill="white"
          stroke="white"
          stroke-width="1.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>

      {props.children}
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
