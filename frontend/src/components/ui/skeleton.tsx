import { cn } from "@/utils/cn"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-white/[0.06] border border-white/[0.03]", className)}
      {...props}
    />
  )
}

export { Skeleton }
