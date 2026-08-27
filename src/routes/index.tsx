import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, KeyRound, ShieldAlert, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/page-header";
import { VerdictBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardInner } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { formatRelativeDe } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const identities = useAppStore((s) => s.identities);
  const audit = useAppStore((s) => s.audit);
  const settings = useAppStore((s) => s.settings);
  const policies = useAppStore((s) => s.policies);

  const pwned = identities.filter((i) => i.hibpStatus === "pwned" || i.knownPwned);
  const denied = audit.filter((a) => a.verdict === "deny");
  const allowed = audit.filter((a) => a.verdict === "allow");

  const chart = [
    { name: "Zugelassen", n: allowed.length },
    { name: "Abgelehnt", n: denied.length },
    { name: "In HIBP", n: pwned.length },
  ];

  return (
    <div>
      <PageHeader
        kicker={settings.dcName}
        title="Domänenfilter"
        description="PwnWächter sitzt vor der Passwortänderung. Steht der Name in Have I Been Pwned, gilt für genau dieses Konto die erhöhte Richtlinie."
        actions={
          <Button asChild>
            <Link to="/gate">
              Wechsel prüfen
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Identitäten" value={identities.length} hint="im Verzeichnis" icon={<Users className="size-4" />} />
        <Stat
          label="In HIBP"
          value={pwned.length}
          hint="erhöhte Richtlinie"
          warn
          icon={<ShieldAlert className="size-4" />}
        />
        <Stat label="Abgelehnt" value={denied.length} hint="Filter-Verweigerungen" icon={<KeyRound className="size-4" />} />
        <Stat
          label="Filter"
          value={settings.filterEnabled ? "aktiv" : "aus"}
          hint={settings.autoElevate ? "Auto-Anhebung an" : "Auto-Anhebung aus"}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardInner>
            <p className="mb-1 text-sm font-medium">Richtlinien-Delta</p>
            <p className="mb-5 text-sm text-muted">
              Was sich ändert, sobald ein Name in Have I Been Pwned auftaucht.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr>
                    <th className="pb-2 font-medium">Regel</th>
                    <th className="pb-2 font-medium">Basis</th>
                    <th className="pb-2 font-medium">Erhöht</th>
                  </tr>
                </thead>
                <tbody className="[&_td]:py-2 [&_tr]:border-t [&_tr]:border-line">
                  <tr>
                    <td>Mindestlänge</td>
                    <td className="tabular-nums">{policies.baseline.minLength}</td>
                    <td className="tabular-nums text-danger">{policies.elevated.minLength}</td>
                  </tr>
                  <tr>
                    <td>Zeichenklassen</td>
                    <td className="tabular-nums">{policies.baseline.minClasses}</td>
                    <td className="tabular-nums text-danger">{policies.elevated.minClasses}</td>
                  </tr>
                  <tr>
                    <td>Sonderzeichen</td>
                    <td>{policies.baseline.requireSpecial ? "ja" : "nein"}</td>
                    <td className="text-danger">{policies.elevated.requireSpecial ? "ja" : "nein"}</td>
                  </tr>
                  <tr>
                    <td>Max. Alter</td>
                    <td className="tabular-nums">{policies.baseline.maxAgeDays} Tage</td>
                    <td className="tabular-nums text-danger">{policies.elevated.maxAgeDays} Tage</td>
                  </tr>
                  <tr>
                    <td>Pwned Passwords</td>
                    <td colSpan={2}>immer gesperrt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardInner>
        </Card>

        <Card>
          <CardInner className="h-full">
            <p className="mb-4 text-sm font-medium">Aktivität</p>
            {audit.length === 0 ? (
              <p className="text-sm text-muted">Noch keine Wechsel. Öffne Passwortwechsel und sende eine Änderung.</p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart} barSize={28}>
                    <XAxis dataKey="name" tick={{ fill: "#8b8d93", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <RTooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      contentStyle={{
                        background: "#1b1d22",
                        border: "1px solid rgba(232,230,227,0.12)",
                        borderRadius: 8,
                        color: "#e8e6e3",
                      }}
                    />
                    <Bar dataKey="n" fill="#7a93a7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardInner>
        </Card>
      </div>

      <Card className="mt-4">
        <CardInner>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium">Letzte Filterentscheidungen</p>
            <Button asChild variant="ghost" size="sm">
              <Link to="/audit">Protokoll</Link>
            </Button>
          </div>
          {audit.length === 0 ? (
            <p className="text-sm text-muted">Leer.</p>
          ) : (
            <ul className="divide-y divide-line">
              {audit.slice(0, 6).map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{a.displayName}</p>
                    <p className="font-mono text-xs text-subtle">{a.sam}</p>
                  </div>
                  {a.identityPwned ? <Badge variant="danger">Name in HIBP</Badge> : <Badge variant="ok">Name sauber</Badge>}
                  <VerdictBadge verdict={a.verdict} />
                  <span className="text-xs text-muted">{formatRelativeDe(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardInner>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  warn,
  icon,
}: {
  label: string;
  value: number | string;
  hint: string;
  warn?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Card>
      <CardInner>
        <div className="flex items-start justify-between">
          <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
          <span className={warn ? "text-danger" : "text-muted"}>{icon}</span>
        </div>
        <p className="mt-3 font-mono text-2xl tabular-nums tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-subtle">{hint}</p>
      </CardInner>
    </Card>
  );
}
