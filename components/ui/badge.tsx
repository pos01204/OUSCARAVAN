import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-dark text-white",
        secondary:
          "border-transparent bg-brand-cream text-brand-dark",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-brand-dark border-brand-cream-dark",
        // 상태 뱃지
        pending:
          "bg-amber-50 text-amber-700 border-amber-200",
        preparing:
          "bg-blue-50 text-blue-700 border-blue-200",
        completed:
          "bg-green-50 text-green-700 border-green-200",
        success:
          "bg-green-50 text-green-700 border-green-200",
        warning:
          "bg-amber-50 text-amber-700 border-amber-200",
        error:
          "bg-red-50 text-red-700 border-red-200",
        info:
          "bg-blue-50 text-blue-700 border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
