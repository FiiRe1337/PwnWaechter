import { Check, LoaderCircle, X } from "lucide-react";
import type { GateStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS: { id: GateStep; label: string; hint: string }[] = [
  { id: "resolve", label: "Identität auflösen", hint: "sAMAccountName · UPN · SID" },
  { id: "hibp-identity", label: "Name in Have I Been Pwned", hint: "Konto / Mail gegen Leak-Katalog" },
  { id: "elevate", label: "Richtlinie anpassen", hint: "Basis oder erhöht (PSO)" },
  { id: "policy", label: "Passwort gegen Richtlinie", hint: "Länge, Klassen, Name, Wörterbuch" },
  { id: "pwned-password", label: "Pwned Passwords", hint: "SHA-1 k-Anonymität, Range-API" },
  { id: "decide", label: "Entscheidung", hint: "LSA Password Filter Rückgabe" },
];

const ORDER: GateStep[] = STEPS.map((s) => s.id);

function rank(step: GateStep): number {
  return ORDER.indexOf(step);
}

export function GatePipeline({
  current,
  identityPwned,
  verdict,
}: {
  current: GateStep;
  identityPwned: boolean | null;
  verdict: "allow" | "deny" | null;
}) {
  const currentRank = rank(current);
  return (
    <ol className="space-y-0">
      {STEPS.map((step, i) => {
        const done = current !== "idle" && i < currentRank;
        const active = current === step.id;
        const failed =
          (step.id === "hibp-identity" && done && identityPwned) ||
          (step.id === "decide" && verdict === "deny");
        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-[0.6875rem] font-medium transition-colors duration-200",
                  active && "bg-steel text-steel-fg",
                  done && !failed && "bg-ok/20 text-ok",
                  done && failed && "bg-danger/20 text-danger",
                  !active && !done && "bg-elevated text-subtle",
                )}
              >
                {active ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : done && failed ? (
                  <X className="size-3.5" />
                ) : done ? (
                  <Check className="size-3.5" />
                ) : (
                  i + 1
                )}
              </span>
              {i < STEPS.length - 1 ? (
                <span className={cn("w-px flex-1 bg-line", done && "bg-ok/30")} />
              ) : null}
            </div>
            <div className={cn("pb-5", i === STEPS.length - 1 && "pb-0")}>
              <p className={cn("text-sm", active || done ? "text-fg" : "text-muted")}>{step.label}</p>
              <p className="text-xs text-subtle">{step.hint}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
