import * as React from "react"
import { cn } from "@/utils/cn"

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "line" | "pills" | "segmented";
  className?: string;
}

export function Tabs({
  tabs,
  activeId,
  onChange,
  variant = "line",
  className,
}: TabsProps) {
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let targetIndex = -1;
    if (e.key === "ArrowRight") {
      targetIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      targetIndex = 0;
    } else if (e.key === "End") {
      targetIndex = tabs.length - 1;
    }

    if (targetIndex >= 0 && !tabs[targetIndex].disabled) {
      e.preventDefault();
      onChange(tabs[targetIndex].id);
      tabRefs.current[targetIndex]?.focus();
    }
  };

  const containerClasses = {
    line: "flex w-full items-center gap-1 overflow-x-auto border-b border-border custom-scrollbar",
    pills: "flex w-full items-center gap-2 overflow-x-auto pb-1 custom-scrollbar",
    segmented: "inline-flex items-center gap-1 p-1 bg-surface-elevated/80 border border-border rounded-2xl overflow-x-auto custom-scrollbar",
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(containerClasses[variant], className)}
    >
      {tabs.map((tab, index) => {
        const isActive = activeId === tab.id;

        const variantClasses = {
          line: cn(
            "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-xl cursor-pointer",
            isActive
              ? "border-primary text-primary"
              : "border-transparent text-foreground-muted hover:border-border-hover hover:text-foreground"
          ),
          pills: cn(
            "flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-xs font-semibold rounded-xl transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95",
            isActive
              ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
              : "bg-surface-elevated text-foreground-muted border-border hover:bg-surface-hover hover:text-foreground hover:border-border-hover"
          ),
          segmented: cn(
            "flex items-center gap-2 whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer",
            isActive
              ? "bg-primary text-white shadow-sm"
              : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
          ),
        };

        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            disabled={tab.disabled}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              variantClasses[variant],
              tab.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
            )}
          >
            {tab.icon && <span className="h-4 w-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-surface text-foreground-muted"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
