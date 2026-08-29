import * as React from "react"
import { cn } from "@/lib/utils"

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeId, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex w-full items-center gap-1 overflow-x-auto border-b border-border hide-scrollbar", className)}>
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:bg-surface-hover rounded-t-xl",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-foreground-muted hover:border-border-hover hover:text-foreground"
            )}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
          >
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
