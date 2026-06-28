import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label?: string;
  variant?: "default" | "danger";
}

export const RemoteButton = forwardRef<HTMLButtonElement, Props>(
  ({ icon, label, variant = "default", className, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        {...rest}
        className={cn(
          "flex h-16 min-w-16 select-none flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card text-foreground transition active:scale-95 active:bg-accent disabled:opacity-50",
          variant === "danger" &&
            "border-destructive/40 bg-destructive/10 text-destructive",
          className,
        )}
      >
        <span className="flex h-6 w-6 items-center justify-center">{icon}</span>
        {label && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        )}
      </button>
    );
  },
);
RemoteButton.displayName = "RemoteButton";
