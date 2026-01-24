import * as React from "react"
import { cn } from "@/lib/utils"

type CardVariant = "default" | "info" | "cta" | "alert" | "muted"

const variantClasses: Record<CardVariant, string> = {
  default: "border-border bg-background-elevated",
  info: "border-border bg-background-elevated relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-brand-cream-dark/35",
  cta: "border-border-emphasis bg-background-elevated relative before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-brand-cream-dark/45",
  alert: "border-border bg-background-elevated relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-2xl before:bg-status-error/50",
  muted: "border-border/40 bg-background-muted",
}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean; variant?: CardVariant }
>(({ className, interactive, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border text-card-foreground shadow-card transition-all duration-200",
      variantClasses[variant],
      interactive && "cursor-pointer hover:shadow-card-hover hover:border-border-emphasis active:scale-[0.99]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 pb-3", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-semibold leading-tight tracking-tight text-brand-dark",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
