import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        // Primary: 다크 배경 + 밝은 텍스트
        default: "bg-brand-dark text-white hover:bg-brand-dark-soft shadow-soft-sm hover:shadow-soft-md",
        // Destructive
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft-sm",
        // Outline: 투명 + 베이지 테두리
        outline:
          "border border-brand-cream-dark bg-transparent text-brand-dark hover:bg-background-muted hover:border-brand-cream-deep",
        // Secondary: 크림 배경 + 다크 텍스트
        secondary:
          "bg-brand-cream text-brand-dark hover:bg-brand-cream-dark shadow-soft-sm",
        // Ghost: 텍스트만
        ghost: "text-brand-dark-muted hover:text-brand-dark hover:bg-background-muted",
        // Link
        link: "text-brand-dark underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
