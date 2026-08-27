import { createFileRoute } from "@tanstack/react-router";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { HibpStatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardInner } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDesc,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupBreachedAccount } from "@/lib/hibp-fn";
import { identityNeedles, localBreachesFor, localIdentityMatch } from "@/lib/hibp";
import { useAppStore } from "@/lib/store";
import type { Identity } from "@/lib/types";
import { formatDeDate } from "@/lib/utils";

export const Route = createFileRoute("/identities")({ component: IdentitiesPage });

function IdentitiesPage() {
  const identities = useAppStore((s) => s.identities);
  const settings = useAppStore((s) => s.settings);
  const addIdentity = useAppStore((s) => s.addIdentity);
  const updateIdentity = useAppStore((s) => s.updateIdentity);
  const removeIdentity = useAppStore((s) => s.removeIdentity);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    sam: "",
    mail: "",
    department: "IT",
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return identities;
    return identities.filter((i) =>
      [i.displayName, i.sam, i.mail, i.upn, i.department].some((v) => v.toLowerCase().includes(s)),
    );
  }, [identities, q]);

  async function syncAll() {
    setSyncing(true);
    let marked = 0;
    try {
      for (const identity of identities) {
        const needles = identityNeedles(identity);
        let pwned = identity.knownPwned || localIdentityMatch(needles);
        let breaches = identity.breaches;
        if (settings.hibpApiKey) {
          const account = identity.mail || identity.upn;
          try {
            const live = await lookupBreachedAccount({
              data: { account, apiKey: settings.hibpApiKey },
            });
            if (live.mode === "live") {
              pwned = live.breaches.length > 0;
              breaches = live.breaches.map((b) => ({
                name: b.Name,
                domain: b.Domain,
                breachDate: b.BreachDate,
                dataClasses: b.DataClasses ?? [],
              }));
            }
          } catch {
            /* keep local */
          }
        } else if (pwned && breaches.length === 0) {
          breaches = localBreachesFor(needles);
        }
        updateIdentity(identity.id, {
          hibpStatus: pwned ? "pwned" : "clean",
          knownPwned: pwned,
          breaches,
          lastHibpCheck: new Date().toISOString(),
        });
        if (pwned) marked += 1;
      }
      toast.success(
        settings.hibpApiKey
          ? `HIBP-Abgleich fertig. ${marked} Identitäten in Leaks.`
          : `Lokaler Katalog abgeglichen. ${marked} Identitäten markiert.`,
      );
    } finally {
      setSyncing(false);
    }
  }

  function submitNew() {
    if (!form.displayName.trim() || !form.sam.trim()) {
      toast.error("Name und sAMAccountName sind Pflicht.");
      return;
    }
    const sam = form.sam.trim().toLowerCase();
    const mail = form.mail.trim() || `${sam}@adlerwerk.de`;
    addIdentity({
      sam,
      upn: `${sam}@${settings.domain}`,
      mail,
      displayName: form.displayName.trim(),
      givenName: form.displayName.trim().split(" ")[0] ?? form.displayName,
      surname: form.displayName.trim().split(" ").slice(1).join(" ") || sam,
      department: form.department.trim() || "IT",
      title: "Benutzer",
      enabled: true,
      lastPasswordSet: new Date().toISOString(),
      ou: `OU=${form.department || "IT"},DC=adlerwerk,DC=local`,
      knownPwned: localIdentityMatch([sam, mail]),
      hibpStatus: localIdentityMatch([sam, mail]) ? "pwned" : "unknown",
      breaches: localIdentityMatch([sam, mail]) ? localBreachesFor([sam, mail]) : [],
    });
    setOpen(false);
    setForm({ displayName: "", sam: "", mail: "", department: "IT" });
    toast.success("Konto angelegt.");
  }

  return (
    <div>
      <PageHeader
        kicker="Active Directory"
        title="Identitäten"
        description="Vor jedem Passwortwechsel prüft der Filter, ob sAMAccountName, UPN oder Mail in Have I Been Pwned stehen. Treffer landen in der Gruppe mit der erhöhten PSO."
        actions={
          <>
            <Button variant="outline" disabled={syncing} onClick={() => void syncAll()}>
              <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
              HIBP-Abgleich
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Konto
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardInner className="p-3 md:p-3">
          <Input
            placeholder="Suchen nach Name, Mail, OU…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </CardInner>
      </Card>

      <div className="space-y-3">
        {filtered.map((identity) => (
          <IdentityCard
            key={identity.id}
            identity={identity}
            onRemove={() => removeIdentity(identity.id)}
            onToggleFlag={() =>
              updateIdentity(identity.id, {
                knownPwned: !identity.knownPwned,
                hibpStatus: !identity.knownPwned ? "pwned" : "clean",
                lastHibpCheck: new Date().toISOString(),
              })
            }
          />
        ))}
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Keine Treffer.</p>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Konto anlegen</DialogTitle>
          <DialogDesc>Wird ins Verzeichnis aufgenommen und beim nächsten Wechsel gegen HIBP geprüft.</DialogDesc>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="dn">Anzeigename</Label>
              <Input
                id="dn"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sam">sAMAccountName</Label>
              <Input
                id="sam"
                value={form.sam}
                onChange={(e) => setForm((f) => ({ ...f, sam: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mail">Mail</Label>
              <Input
                id="mail"
                value={form.mail}
                onChange={(e) => setForm((f) => ({ ...f, mail: e.target.value }))}
                placeholder="optional"
              />
            </div>
            <Button className="w-full" onClick={submitNew}>
              Anlegen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IdentityCard({
  identity,
  onRemove,
  onToggleFlag,
}: {
  identity: Identity;
  onRemove: () => void;
  onToggleFlag: () => void;
}) {
  const pwned = identity.hibpStatus === "pwned" || identity.knownPwned;
  return (
    <Card>
      <CardInner>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{identity.displayName}</p>
              <HibpStatusBadge status={pwned ? "pwned" : identity.hibpStatus} />
              {!identity.enabled ? <Badge>deaktiviert</Badge> : null}
              {pwned ? <Badge variant="warn">PSO erhöht</Badge> : null}
            </div>
            <p className="mt-1 font-mono text-xs text-muted">
              {identity.sam} · {identity.mail}
            </p>
            <p className="mt-1 font-mono text-[0.6875rem] text-subtle">{identity.ou}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onToggleFlag}>
              {pwned ? "Als sauber markieren" : "Als HIBP markieren"}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Löschen" onClick={onRemove}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
        {identity.breaches.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {identity.breaches.map((b) => (
              <li key={b.name}>
                <Badge variant="danger">
                  {b.name}
                  {b.breachDate ? ` · ${b.breachDate.slice(0, 4)}` : ""}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-3 text-xs text-subtle">
          Letzter HIBP-Check {identity.lastHibpCheck ? formatDeDate(identity.lastHibpCheck) : "nie"} ·
          Passwort gesetzt {formatDeDate(identity.lastPasswordSet)}
        </p>
      </CardInner>
    </Card>
  );
}
