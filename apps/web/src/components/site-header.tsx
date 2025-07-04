"use client"
import { Separator } from "@repo/ui/components/separator"
import { SidebarTrigger } from "@repo/ui/components/sidebar"
import { useEffect, useState } from "react"
import ToggleTheme from "./toggle-Theme"

export function SiteHeader() {
  const [currentTime, setCurrentTime] = useState<null | Date>(null)
  const updateTime = () => {
    const now = new Date()
    setCurrentTime(now)
  }
  useEffect(() => {
    // Update time every second
    setInterval(updateTime, 1000)
  }, [])
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Documents</h1>
        <div className="ml-auto flex items-center gap-2">
          <ToggleTheme />
          {currentTime ? (
            <span className="text-sm text-gray-500">
              {`${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}`}
              {`, `}
              {`${currentTime.toLocaleDateString('default', { weekday: 'long' })}, `}
              {`${currentTime.getDate()} ${currentTime.toLocaleString('default', { month: 'long' })} ${currentTime.getFullYear()}`} 
            </span>
          ) : (
            <span className="text-sm text-gray-500">Loading time...</span>
          )}
        </div>
      </div>
    </header>
  )
}
