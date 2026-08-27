import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  FileText,
  KeyRound,
  Menu,
  Shield,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Übersicht", icon: Activity },
  { to: "/gate", label: "Passwortwechsel", icon: KeyRound },
  { to: "/identities", label: "Identitäten", icon: Users },
  { to: "/policy", label: "Richtlinien", icon: SlidersHorizontal },
  { to: "/audit", label: "Protokoll", icon: FileText },
  { to: "/deploy", label: "Bereitstellung", icon: Shield },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex h-11 items-center gap-3 rounded-sm px-3 text-sm transition-colors duration-150",
              active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/60 hover:text-fg",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  const filterEnabled = useAppStore((s) => s.settings.filterEnabled);
  return (
    <div className="flex items-center gap-3 px-2 py-3">
      <div className="flex size-9 items-center justify-center rounded-sm bg-paper text-ink">
        <Shield className="size-4" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium tracking-tight">PwnWächter</p>
        <p className="truncate font-mono text-[0.6875rem] text-muted">DC-Passwortfilter</p>
      </div>
      <Badge variant={filterEnabled ? "ok" : "danger"} className="ml-auto">
        {filterEnabled ? "aktiv" : "aus"}
      </Badge>
    </div>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const settings = useAppStore((s) => s.settings);
  return (
    <div className="flex h-full flex-col">
      <Brand />
      <div className="mt-2 flex-1 px-1">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="mt-auto border-t border-line px-3 py-4">
        <p className="font-mono text-[0.6875rem] text-subtle">{settings.dcName}</p>
        <p className="mt-0.5 font-mono text-[0.6875rem] text-subtle">{settings.domain}</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const settings = useAppStore((s) => s.settings);

  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-line bg-surface md:flex md:flex-col">
        <SidebarBody />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur-sm md:hidden">
        <Button variant="ghost" size="icon" aria-label="Menü" onClick={() => setOpen(true)}>
          <Menu className="size-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-steel" />
          <span className="text-sm font-medium">PwnWächter</span>
        </div>
        <Badge variant="steel" className="ml-auto truncate">
          {settings.dcName}
        </Badge>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left">
          <div className="flex justify-end p-1">
            <Button variant="ghost" size="icon" aria-label="Schließen" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="md:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
