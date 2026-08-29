import * as React from "react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  delayMs?: number;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ children, content, delayMs = 300, position = "top", className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-surface-elevated border-l-transparent border-r-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-surface-elevated border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-surface-elevated border-t-transparent border-b-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-surface-elevated border-t-transparent border-b-transparent border-l-transparent",
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 px-3 py-1.5 text-xs font-medium text-foreground bg-surface-elevated border border-border rounded-lg shadow-elevated whitespace-nowrap pointer-events-none",
              positionClasses[position],
              className
            )}
            role="tooltip"
          >
            {content}
            {/* Arrow */}
            <div 
              className={cn(
                "absolute border-4",
                arrowClasses[position]
              )} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
