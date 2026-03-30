import type { HTMLAttributes, ReactNode } from "react";

type PillVariant = "neutral" | "subtle" | "accent" | "success";
type PillSize = "sm" | "md";

type PillProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  size?: PillSize;
  variant?: PillVariant;
};

const baseStyles =
  "inline-flex items-center rounded-full font-semibold uppercase";

const sizeStyles: Record<PillSize, string> = {
  sm: "px-2 py-1 text-xs tracking-[0.16em]",
  md: "px-3 py-1 text-xs tracking-[0.2em]",
};

const variantStyles: Record<PillVariant, string> = {
  neutral: "border border-(--line) bg-white/80 text-(--muted)",
  subtle: "border border-(--line) bg-white/60 text-(--muted)",
  accent: "bg-(--accent-soft) text-(--accent-strong)",
  success: "bg-green-100 text-green-800",
};

export const Pill = ({
  children,
  className,
  size = "md",
  variant = "neutral",
  ...props
}: PillProps) => {
  const nextClassName = [
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={nextClassName} {...props}>
      {children}
    </span>
  );
};
