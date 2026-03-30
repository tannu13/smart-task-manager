import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "dangerOutline";
type ButtonSize = "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseStyles =
  "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-(--accent-soft) disabled:cursor-not-allowed disabled:opacity-60";

const sizeStyles: Record<ButtonSize, string> = {
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-sm",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-(--ink) text-white hover:bg-black",
  secondary: "border border-black/10 text-(--ink) hover:border-black/30",
  danger: "bg-(--danger-strong) text-white hover:brightness-95",
  dangerOutline:
    "border border-black/10 text-(--ink) hover:border-(--danger-strong) hover:text-(--danger-strong)",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      size = "md",
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) => {
    const nextClassName = [
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <button ref={ref} type={type} className={nextClassName} {...props} />;
  },
);

Button.displayName = "Button";
