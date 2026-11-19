import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
}

export type { ButtonProps };

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--v3-cta-primary-bg)] text-[var(--v3-cta-primary-text)] hover:brightness-110",
  secondary:
    "border-[var(--v3-accent-secondary)] bg-[var(--v3-accent-secondary)] text-[var(--v3-cta-primary-text)] hover:brightness-105",
  outline:
    "border-[var(--v3-border)] bg-transparent text-[var(--v3-text-primary)] hover:border-[var(--v3-accent-primary)] hover:bg-[var(--v3-highlight)]",
  ghost:
    "border-transparent bg-transparent text-current hover:border-[var(--v3-border)] hover:bg-[var(--v3-highlight)]",
};

export function Button({
  className,
  asChild = false,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={twMerge(
        clsx(
          "v4-button inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--v3-radius-button)] border px-5 py-2.5 text-sm font-semibold tracking-[-0.01em] transition-[background-color,border-color,box-shadow,color,filter,transform] duration-[240ms] hover:scale-[1.06] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[var(--v3-focus-ring)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none",
          variantClasses[variant],
          className,
        ),
      )}
      data-v4-variant={variant}
      {...(!asChild ? { type } : {})}
      {...props}
    />
  );
}
