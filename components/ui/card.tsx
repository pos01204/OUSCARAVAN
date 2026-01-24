import * as React from "react"
import { cn } from "@/lib/utils"

type CardVariant = "default" | "info" | "cta" | "alert" | "muted" | "premium"

const variantClasses: Record<CardVariant, string> = {
  default: "border-border bg-background-elevated card-inner-highlight",
  info: "border-border bg-background-elevated card-inner-highlight relative before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-2xl before:bg-gradient-to-r before:from-transparent before:via-status-info/30 before:to-transparent",
  cta: "border-border-emphasis bg-background-elevated card-inner-highlight relative before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:rounded-t-2xl before:bg-gradient-to-r before:from-transparent before:via-status-info/40 before:to-transparent",
  alert: "border-border bg-background-elevated card-inner-highlight relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-2xl before:bg-status-error/50",
  muted: "border-border/40 bg-background-muted",
  premium: "border-border/60 bg-background-elevated card-premium",
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
      interactive && [
        "cursor-pointer",
        "hover:shadow-card-hover hover:border-border-emphasis",
        "active:scale-[0.99] active:shadow-card",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-info/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      ],
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { compact?: boolean }
>(({ className, compact, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      compact ? "p-3 pb-2" : "p-4 pb-3",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { size?: 'sm' | 'default' | 'lg' }
>(({ className, size = 'default', ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold leading-tight tracking-tight text-brand-dark",
      size === 'sm' && "text-sm",
      size === 'default' && "text-base",
      size === 'lg' && "text-lg",
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
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { compact?: boolean }
>(({ className, compact, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      compact ? "p-3 pt-0" : "p-4 pt-0",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { bordered?: boolean }
>(({ className, bordered, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-4 pt-3",
      bordered && "border-t border-border/50 mt-1",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// 카드 내부 인셋 영역
const CardInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: 'sm' | 'default' }
>(({ className, size = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      size === 'sm' ? "card-inset-sm" : "card-inset",
      className
    )}
    {...props}
  />
))
CardInset.displayName = "CardInset"

// 카드 내부 구분선
const CardDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("card-divider my-3", className)}
    {...props}
  />
))
CardDivider.displayName = "CardDivider"

// 카드 라벨-값 쌍
const CardLabelValue = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    label: string; 
    value: string | React.ReactNode;
    valueSize?: 'default' | 'lg';
    valueClassName?: string;
  }
>(({ className, label, value, valueSize = 'default', valueClassName, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-0.5", className)} {...props}>
    <p className="card-label">{label}</p>
    <p className={cn(
      valueSize === 'lg' ? "card-value-lg" : "card-value",
      valueClassName
    )}>
      {value}
    </p>
  </div>
))
CardLabelValue.displayName = "CardLabelValue"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardInset,
  CardDivider,
  CardLabelValue,
}
