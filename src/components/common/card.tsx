import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children: ReactNode;
}

export function Card({
  asChild = false,
  children,
  className,
  ...props
}: CardProps) {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      className={twMerge(
        clsx(
          "v4-glass-panel group relative overflow-hidden rounded-[var(--v3-radius-card)] border border-[var(--v3-border)] bg-[var(--v3-surface)] text-[var(--v3-text-primary)] shadow-[var(--v3-shadow-small)]",
          className,
        ),
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export type { CardProps };

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  return (
    <div
      className={twMerge(clsx("p-[var(--v3-space-6)] sm:p-[var(--v3-space-8)]", className))}
      {...props}
    >
      {children}
    </div>
  );
}
