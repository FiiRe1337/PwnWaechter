import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { GatePipeline } from "@/components/gate-pipeline";
import { PageHeader } from "@/components/page-header";
import { LiveCheckList, PolicyRequirementList } from "@/components/requirement-list";
import { HibpStatusBadge, VerdictBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardInner } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchPwnedRange, lookupBreachedAccount } from "@/lib/hibp-fn";
import {
  identityNeedles,
  localBreachesFor,
  localIdentityMatch,
  localPasswordHits,
  parseRangeBody,
  sha1Hex,
} from "@/lib/hibp";
import { allPassed, evaluatePassword, policyModeFor, strengthScore } from "@/lib/policy";
import { useAppStore } from "@/lib/store";
import type { CheckResult, GateStep, Identity, PolicyMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gate")({ component: GatePage });

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function GatePage() {
  const identities = useAppStore((s) => s.identities);
  const policies = useAppStore((s) => s.policies);
  const settings = useAppStore((s) => s.settings);
  const updateIdentity = useAppStore((s) => s.updateIdentity);
  const pushAudit = useAppStore((s) => s.pushAudit);

  const enabled = identities.filter((i) => i.enabled);
  const [identityId, setIdentityId] = useState(enabled[0]?.id ?? "");
  const identity = identities.find((i) => i.id === identityId) ?? enabled[0];

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<GateStep>("idle");
  const [verdict, setVerdict] = useState<"allow" | "deny" | null>(null);
  const [finalChecks, setFinalChecks] = useState<CheckResult[] | null>(null);
  const [pwnedHits, setPwnedHits] = useState<number | null>(null);
  const [appliedMode, setAppliedMode] = useState<PolicyMode | null>(null);
  const [identityPwned, setIdentityPwned] = useState<boolean | null>(null);

  const liveMode: PolicyMode = identity
    ? policyModeFor(identity, settings.autoElevate)
    : "baseline";
  const livePolicy = policies[liveMode];

  const previewChecks = useMemo(() => {
    if (!identity || !password) return [];
    return evaluatePassword({
      password,
      identity,
      policy: livePolicy,
      mode: liveMode,
      pwnedHits: null,
      hibpReachable: true,
    }).filter((c) => c.code !== "hibp-pw");
  }, [identity, password, livePolicy, liveMode]);

  const score = strengthScore(password, previewChecks);

  useEffect(() => {
    setVerdict(null);
    setFinalChecks(null);
    setPwnedHits(null);
    setAppliedMode(null);
    setIdentityPwned(null);
    setStep("idle");
    setPassword("");
    setConfirm("");
  }, [identityId]);

  async function runGate() {
    if (!identity) return;
    if (!settings.filterEnabled) {
      toast.error("Filter ist deaktiviert — Änderung würde ungeprüft durchgehen.");
      return;
    }
    if (!password) {
      toast.error("Neues Passwort fehlt.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwörter stimmen nicht überein.");
      return;
    }

    setBusy(true);
    setVerdict(null);
    setFinalChecks(null);

    try {
      setStep("resolve");
      await sleep(420);

      setStep("hibp-identity");
      const needles = identityNeedles(identity);
      let pwned = identity.hibpStatus === "pwned" || identity.knownPwned || localIdentityMatch(needles);
      let breaches = identity.breaches;

      if (settings.hibpApiKey) {
        const account = identity.mail || identity.upn;
        const live = await lookupBreachedAccount({ data: { account, apiKey: settings.hibpApiKey } });
        if (live.mode === "live") {
          pwned = live.breaches.length > 0;
          breaches = live.breaches.map((b) => ({
            name: b.Name,
            domain: b.Domain,
            breachDate: b.BreachDate,
            dataClasses: b.DataClasses ?? [],
          }));
        } else if (live.mode === "unauthorized") {
          toast.error("HIBP-API-Schlüssel wurde abgelehnt.");
        }
      } else if (!pwned) {
        const extra = localBreachesFor(needles);
        if (extra.length) {
          pwned = true;
          breaches = extra;
        }
      }

      updateIdentity(identity.id, {
        hibpStatus: pwned ? "pwned" : "clean",
        breaches,
        lastHibpCheck: new Date().toISOString(),
        knownPwned: pwned,
      });
      setIdentityPwned(pwned);
      await sleep(520);

      setStep("elevate");
      const mode: PolicyMode = settings.autoElevate && pwned ? "elevated" : "baseline";
      const policy = policies[mode];
      setAppliedMode(mode);
      await sleep(480);

      setStep("policy");
      await sleep(360);

      setStep("pwned-password");
      let hits = 0;
      let hibpReachable = false;
      if (settings.checkPwnedPasswords && policy.banPwnedPasswords) {
        const localHits = localPasswordHits(password);
        hits = localHits;
        try {
          const hash = await sha1Hex(password);
          const prefix = hash.slice(0, 5);
          const suffix = hash.slice(5);
          const range = await fetchPwnedRange({ data: { prefix } });
          hits = Math.max(localHits, parseRangeBody(range.text, suffix));
          hibpReachable = true;
        } catch {
          hibpReachable = false;
          if (hits === 0) {
            toast.message("HIBP nicht erreichbar — lokaler Notfallkatalog verwendet.");
          }
        }
      }
      setPwnedHits(hits);
      await sleep(280);

      const checks = evaluatePassword({
        password,
        identity,
        policy,
        mode,
        pwnedHits: hits,
        hibpReachable,
      });
      const mismatch: CheckResult = {
        code: "confirm",
        label: "Bestätigung identisch",
        detail: password === confirm ? "Felder stimmen überein" : "Weicht ab",
        passed: password === confirm,
      };
      const all = [...checks, mismatch];
      const ok = allPassed(all);

      setFinalChecks(all);
      setStep("decide");
      await sleep(280);
      setVerdict(ok ? "allow" : "deny");

      pushAudit({
        identityId: identity.id,
        sam: identity.sam,
        displayName: identity.displayName,
        identityPwned: pwned,
        breachCount: breaches.length,
        policyApplied: mode,
        pwnedPasswordHits: hits,
        hibpReachable,
        verdict: ok ? "allow" : "deny",
        reasons: all.filter((c) => !c.passed).map((c) => c.label),
        checks: all,
      });

      if (ok) {
        updateIdentity(identity.id, { lastPasswordSet: new Date().toISOString() });
        toast.success("Passwortänderung zugelassen.");
      } else {
        toast.error("Passwortänderung abgelehnt.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (!identity) {
    return <p className="text-muted">Keine aktivierten Identitäten.</p>;
  }

  return (
    <div>
      <PageHeader
        kicker="LSA Password Filter"
        title="Passwortwechsel"
        description="Wie auf dem Domain Controller: Zuerst wird der Name gegen Have I Been Pwned geprüft. Steht die Identität in einem Leak, gilt ab sofort die erhöhte Richtlinie — erst dann wird das neue Passwort bewertet."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card>
          <CardInner>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-sm bg-paper text-ink">
                <KeyRound className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Sicherheitshinweis</p>
                <p className="font-mono text-xs text-muted">{settings.dcName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="identity">Benutzerkonto</Label>
                <select
                  id="identity"
                  value={identity.id}
                  onChange={(e) => setIdentityId(e.target.value)}
                  className="flex h-11 w-full rounded-sm bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel/50"
                >
                  {enabled.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.displayName} ({i.sam})
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="font-mono text-xs text-subtle">{identity.upn}</span>
                  <HibpStatusBadge status={liveMode === "elevated" ? "pwned" : identity.hibpStatus} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pw">Neues Passwort</Label>
                <div className="relative">
                  <Input
                    id="pw"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    aria-label={show ? "Verbergen" : "Anzeigen"}
                    className="absolute top-0 right-0 flex size-11 items-center justify-center text-muted hover:text-fg"
                    onClick={() => setShow((v) => !v)}
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pw2">Bestätigung</Label>
                <Input
                  id="pw2"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {password ? (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted">
                    <span>Stärke (vor HIBP-Passwortcheck)</span>
                    <span className="tabular-nums">{score}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-elevated">
                    <div
                      className={cn(
                        "h-full transition-[width] duration-200",
                        score < 40 ? "bg-danger" : score < 75 ? "bg-warn" : "bg-ok",
                      )}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <Button className="w-full" disabled={busy} onClick={() => void runGate()}>
                {busy ? "Filter prüft…" : "Änderung an den DC senden"}
              </Button>
            </div>
          </CardInner>
        </Card>

        <Card>
          <CardInner>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Filter-Pipeline</p>
              {verdict ? <VerdictBadge verdict={verdict} /> : null}
            </div>
            <GatePipeline current={step} identityPwned={identityPwned} verdict={verdict} />
          </CardInner>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardInner>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Aktive Anforderung</p>
              <Badge variant={liveMode === "elevated" ? "danger" : "steel"}>
                {liveMode === "elevated" ? "erhöht · HIBP" : "Basis"}
              </Badge>
            </div>
            {liveMode === "elevated" ? (
              <div className="mb-4 flex gap-3 rounded-md bg-danger/10 px-3 py-3 text-sm">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" />
                <p>
                  Der Name dieser Identität steht in Have I Been Pwned
                  {identity.breaches.length
                    ? ` (${identity.breaches.map((b) => b.name).join(", ")})`
                    : ""}
                  . Die Passwortrichtlinie wurde für genau dieses Konto angehoben.
                </p>
              </div>
            ) : (
              <p className="mb-4 text-sm text-muted">
                Kein Treffer im Identitätskatalog. Es gilt die Standardrichtlinie der Domäne — Pwned
                Passwords werden trotzdem gesperrt.
              </p>
            )}
            <PolicyRequirementList policy={livePolicy} mode={liveMode} />
          </CardInner>
        </Card>

        <Card>
          <CardInner>
            <p className="mb-3 text-sm font-medium">
              {finalChecks ? "Ergebnis der Filterprüfung" : "Live-Prüfung"}
            </p>
            <LiveCheckList checks={finalChecks ?? previewChecks} />
            {appliedMode && pwnedHits !== null ? (
              <p className="mt-4 font-mono text-xs text-subtle">
                Richtlinie {appliedMode === "elevated" ? "erhöht" : "Basis"} · Pwned-Hits{" "}
                {pwnedHits.toLocaleString("de-DE")}
              </p>
            ) : null}
          </CardInner>
        </Card>
      </div>
    </div>
  );
}
