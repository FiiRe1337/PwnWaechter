import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-bg/70 data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]",
          "focus:outline-none",
          className,
        )}
        {...props}
      >
        <div className="relative rounded-lg bg-elevated/50 p-5">
          {children}
          <DialogPrimitive.Close className="absolute top-3 right-3 size-11 rounded-sm text-muted hover:text-fg">
            <X className="mx-auto size-4" />
            <span className="sr-only">Schließen</span>
          </DialogPrimitive.Close>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("pr-8 text-base font-medium", className)} {...props} />;
}

export function DialogDesc({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("mt-1 text-sm text-muted", className)} {...props} />;
}
