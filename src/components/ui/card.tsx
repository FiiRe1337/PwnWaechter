import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardInner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("rounded-lg bg-elevated/40 p-4 md:p-5", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-base font-medium tracking-tight", className)} {...props} />;
}

export function CardDesc({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}
