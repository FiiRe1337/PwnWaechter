import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardInner } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import type { PolicyProfile } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/policy")({ component: PolicyPage });

function PolicyPage() {
  const policies = useAppStore((s) => s.policies);
  const setPolicies = useAppStore((s) => s.setPolicies);
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const resetDemo = useAppStore((s) => s.resetDemo);

  return (
    <div>
      <PageHeader
        kicker="Fine-Grained Password Policy"
        title="Richtlinien"
        description="Zwei Profile: Basis für saubere Konten, erhöht sobald der Name in Have I Been Pwned steht. Auf einem echten DC entspricht das einer PSO auf der Gruppe PwnWaechter-Pwned."
        actions={
          <Button
            variant="outline"
            onClick={() => {
              resetDemo();
              toast.message("Demo zurückgesetzt.");
            }}
          >
            Demo zurücksetzen
          </Button>
        }
      />

      <Card className="mb-4">
        <CardInner>
          <p className="mb-4 text-sm font-medium">Filter auf dem DC</p>
          <div className="space-y-4">
            <RowSwitch
              label="Password Filter aktiv"
              hint="Ohne Filter ginge jede Änderung ungeprüft durch."
              checked={settings.filterEnabled}
              onCheckedChange={(v) => setSettings({ filterEnabled: v })}
            />
            <RowSwitch
              label="Richtlinie automatisch anheben"
              hint="Name in HIBP → PSO-Profil „erhöht“ für genau dieses Konto."
              checked={settings.autoElevate}
              onCheckedChange={(v) => setSettings({ autoElevate: v })}
            />
            <RowSwitch
              label="Pwned Passwords prüfen"
              hint="SHA-1 k-Anonymität gegen api.pwnedpasswords.com, niemals das Klartext-Passwort senden."
              checked={settings.checkPwnedPasswords}
              onCheckedChange={(v) => setSettings({ checkPwnedPasswords: v })}
            />
            <div className="space-y-1.5">
              <Label htmlFor="hibp-key">HIBP-API-Schlüssel (optional)</Label>
              <Input
                id="hibp-key"
                type="password"
                autoComplete="off"
                placeholder="Ohne Schlüssel: lokaler Leak-Katalog"
                value={settings.hibpApiKey}
                onChange={(e) => setSettings({ hibpApiKey: e.target.value })}
              />
              <p className="text-xs text-subtle">
                Nur für die Konto-API (Name in Leaks). Pwned Passwords braucht keinen Schlüssel. Der Wert bleibt im
                Browser, geht nicht in ein Repo.
              </p>
            </div>
          </div>
        </CardInner>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <PolicyEditor
          title="Basis"
          badge="saubere Identität"
          profile={policies.baseline}
          onChange={(baseline) => setPolicies({ ...policies, baseline })}
        />
        <PolicyEditor
          title="Erhöht"
          badge="Name in HIBP"
          danger
          profile={policies.elevated}
          onChange={(elevated) => setPolicies({ ...policies, elevated })}
        />
      </div>
    </div>
  );
}

function PolicyEditor({
  title,
  badge,
  danger,
  profile,
  onChange,
}: {
  title: string;
  badge: string;
  danger?: boolean;
  profile: PolicyProfile;
  onChange: (p: PolicyProfile) => void;
}) {
  const patch = (p: Partial<PolicyProfile>) => onChange({ ...profile, ...p });
  return (
    <Card>
      <CardInner>
        <div className="mb-5 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{title}</p>
          <Badge variant={danger ? "danger" : "steel"}>{badge}</Badge>
        </div>
        <div className="space-y-5">
          <NumberRow
            label="Mindestlänge"
            value={profile.minLength}
            min={8}
            max={32}
            onChange={(minLength) => patch({ minLength })}
          />
          <NumberRow
            label="Zeichenklassen"
            value={profile.minClasses}
            min={2}
            max={4}
            onChange={(minClasses) => patch({ minClasses })}
          />
          <NumberRow
            label="Unterschiedliche Zeichen"
            value={profile.minUniqueChars}
            min={4}
            max={24}
            onChange={(minUniqueChars) => patch({ minUniqueChars })}
          />
          <NumberRow
            label="Max. Alter (Tage)"
            value={profile.maxAgeDays}
            min={7}
            max={365}
            onChange={(maxAgeDays) => patch({ maxAgeDays })}
          />
          <RowSwitch
            label="Sonderzeichen Pflicht"
            checked={profile.requireSpecial}
            onCheckedChange={(requireSpecial) => patch({ requireSpecial })}
          />
          <RowSwitch
            label="Kein Kontoname"
            checked={profile.banUsername}
            onCheckedChange={(banUsername) => patch({ banUsername })}
          />
          <RowSwitch
            label="Kein Anzeigename"
            checked={profile.banDisplayName}
            onCheckedChange={(banDisplayName) => patch({ banDisplayName })}
          />
          <RowSwitch
            label="Tastaturfolgen sperren"
            checked={profile.banKeyboardWalks}
            onCheckedChange={(banKeyboardWalks) => patch({ banKeyboardWalks })}
          />
          <RowSwitch
            label="Wörterbuchwörter sperren"
            checked={profile.banCommonWords}
            onCheckedChange={(banCommonWords) => patch({ banCommonWords })}
          />
        </div>
      </CardInner>
    </Card>
  );
}

function NumberRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-mono tabular-nums text-muted">{value}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={1} onValueChange={([v]) => onChange(v ?? value)} />
    </div>
  );
}

function RowSwitch({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm">{label}</p>
        {hint ? <p className="text-xs text-subtle">{hint}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

