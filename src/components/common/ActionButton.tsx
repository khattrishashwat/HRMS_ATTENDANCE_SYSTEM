import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonVariant = "primary" | "outline";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ActionButtonVariant;
  icon?: ReactNode;
  children: ReactNode;
};

const variantClass: Record<ActionButtonVariant, string> = {
  primary:
    "border-transparent bg-primary text-white hover:opacity-90 focus-visible:ring-primary/30",
  outline:
    "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] focus-visible:ring-[#E5E7EB]",
};

/** Pill action button used across list pages (primary / outline). */
export default function ActionButton({
  variant = "outline",
  icon,
  children,
  className = "",
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${className}`}
      {...props}
    >
      {icon}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
}
