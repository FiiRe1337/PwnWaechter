import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { VerdictBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardInner } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { formatDeDate } from "@/lib/utils";

export const Route = createFileRoute("/audit")({ component: AuditPage });

function AuditPage() {
  const audit = useAppStore((s) => s.audit);
  const clearAudit = useAppStore((s) => s.clearAudit);

  return (
    <div>
      <PageHeader
        kicker="Security Event Log"
        title="Protokoll"
        description="Jede Entscheidung des Filters: ob der Name in Have I Been Pwned stand, welches Profil galt, und warum zugelassen oder abgelehnt wurde."
        actions={
          <Button variant="outline" onClick={clearAudit} disabled={audit.length === 0}>
            Leeren
          </Button>
        }
      />

      {audit.length === 0 ? (
        <Card>
          <CardInner>
            <p className="text-sm text-muted">Noch keine Ereignisse. Ein Passwortwechsel schreibt den ersten Eintrag.</p>
          </CardInner>
        </Card>
      ) : (
        <div className="space-y-3">
          {audit.map((a) => (
            <Card key={a.id}>
              <CardInner>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{a.displayName}</p>
                    <p className="font-mono text-xs text-muted">{a.sam}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.identityPwned ? (
                      <Badge variant="danger">Name in HIBP · {a.breachCount} Leaks</Badge>
                    ) : (
                      <Badge variant="ok">Name sauber</Badge>
                    )}
                    <Badge variant={a.policyApplied === "elevated" ? "warn" : "steel"}>
                      {a.policyApplied === "elevated" ? "erhöht" : "Basis"}
                    </Badge>
                    <VerdictBadge verdict={a.verdict} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-subtle">{formatDeDate(a.at)}</p>
                {a.pwnedPasswordHits !== null ? (
                  <p className="mt-1 font-mono text-xs text-muted">
                    Pwned Passwords: {a.pwnedPasswordHits.toLocaleString("de-DE")} Treffer
                    {a.hibpReachable ? "" : " (lokaler Katalog)"}
                  </p>
                ) : null}
                {a.reasons.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {a.reasons.map((r) => (
                      <li key={r}>
                        <Badge variant="danger">{r}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-ok">Alle Regeln erfüllt.</p>
                )}
              </CardInner>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
