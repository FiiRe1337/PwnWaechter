import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-elevated text-muted",
        steel: "bg-steel/15 text-steel",
        ok: "bg-ok/15 text-ok",
        warn: "bg-warn/15 text-warn",
        danger: "bg-danger/15 text-danger",
        paper: "bg-paper/10 text-fg",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
