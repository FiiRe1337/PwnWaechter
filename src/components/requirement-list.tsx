import { Check, Minus, X } from "lucide-react";
import type { CheckResult, PolicyMode, PolicyProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

function Row({
  ok,
  label,
  hint,
  pending,
}: {
  ok?: boolean;
  label: string;
  hint?: string;
  pending?: boolean;
}) {
  return (
    <li className="flex items-start gap-3 py-2">
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
          pending
            ? "bg-elevated text-muted"
            : ok
              ? "bg-ok/15 text-ok"
              : ok === false
                ? "bg-danger/15 text-danger"
                : "bg-elevated text-muted",
        )}
      >
        {pending ? (
          <Minus className="size-3" />
        ) : ok ? (
          <Check className="size-3" />
        ) : ok === false ? (
          <X className="size-3" />
        ) : (
          <Minus className="size-3" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-sm">{label}</span>
        {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </span>
    </li>
  );
}

export function PolicyRequirementList({
  policy,
  mode,
}: {
  policy: PolicyProfile;
  mode: PolicyMode;
}) {
  return (
    <ul className="divide-y divide-line">
      <Row label={`Mindestens ${policy.minLength} Zeichen`} />
      <Row label={`${policy.minClasses} Zeichenklassen (klein / groß / Ziffer / Sonder)`} />
      {policy.requireSpecial ? <Row label="Sonderzeichen Pflicht" /> : null}
      {policy.banUsername ? <Row label="Kein Kontoname im Passwort" /> : null}
      {policy.banDisplayName ? <Row label="Kein Vor- oder Nachname im Passwort" /> : null}
      {policy.banPwnedPasswords ? <Row label="Nicht in Have I Been Pwned (Passwörter)" /> : null}
      {policy.banKeyboardWalks ? <Row label="Keine QWERTZ-Folgen" /> : null}
      {policy.banRepeats ? <Row label="Keine dreifache Zeichenwiederholung" /> : null}
      {policy.banCommonWords ? <Row label="Keine Wörterbuchwörter" /> : null}
      <Row
        label={`Gültigkeit ${policy.maxAgeDays} Tage · Verlauf ${policy.historyCount}`}
        hint={mode === "elevated" ? "Erhöhte Richtlinie für kompromittierte Identität" : "Standardrichtlinie der Domäne"}
      />
    </ul>
  );
}

export function LiveCheckList({ checks }: { checks: CheckResult[] }) {
  if (checks.length === 0) {
    return <p className="py-6 text-sm text-muted">Passwort eingeben, um die Prüfung zu sehen.</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {checks.map((c) => (
        <Row key={c.code} ok={c.passed} label={c.label} hint={c.detail} />
      ))}
    </ul>
  );
}
