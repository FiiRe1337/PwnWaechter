import { Badge } from "@/components/ui/badge";
import type { HibpStatus } from "@/lib/types";

export function HibpStatusBadge({ status }: { status: HibpStatus }) {
  if (status === "pwned") return <Badge variant="danger">in HIBP</Badge>;
  if (status === "clean") return <Badge variant="ok">sauber</Badge>;
  if (status === "watching") return <Badge variant="warn">beobachtet</Badge>;
  return <Badge>ungeprüft</Badge>;
}

export function VerdictBadge({ verdict }: { verdict: "allow" | "deny" }) {
  return verdict === "allow" ? (
    <Badge variant="ok">zugelassen</Badge>
  ) : (
    <Badge variant="danger">abgelehnt</Badge>
  );
}
