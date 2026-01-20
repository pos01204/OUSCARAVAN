import { cn } from "@/lib/utils"

function Skeleton({
  className,
  shimmer = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { shimmer?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl",
        shimmer 
          ? "skeleton-shimmer" 
          : "animate-pulse bg-background-muted",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
