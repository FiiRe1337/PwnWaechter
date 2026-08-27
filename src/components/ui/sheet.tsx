import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "left",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { side?: "left" | "right" }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-bg/70" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-0 z-50 flex h-full w-[min(88vw,280px)] flex-col bg-surface p-2 shadow-[var(--shadow-border)]",
          side === "left" ? "left-0" : "right-0",
          className,
        )}
        {...props}
      >
        <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
