import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardInner } from "@/components/ui/card";
import { PS_CREATE_PSO, PS_HIBP_SYNC, PS_PASSWORD_FILTER_NOTE } from "@/lib/deploy-scripts";

export const Route = createFileRoute("/deploy")({ component: DeployPage });

function DeployPage() {
  return (
    <div>
      <PageHeader
        kicker="Windows Server"
        title="Bereitstellung"
        description="Diese Konsole ist die Schaltzentrale und der Simulator. Auf einem echten Domain Controller übernimmt eine Fine-Grained Password Policy die erhöhten Anforderungen — und ein nativer Password Filter die Pwned-Passwort-Sperre."
      />

      <ol className="mb-6 space-y-4">
        <Step n="1" title="Gruppe + PSO">
          Konten, deren Name in Have I Been Pwned steht, kommen in die Gruppe PwnWaechter-Pwned. Die verknüpfte PSO
          hebt Länge, Komplexität und Höchstalter nur für diese Konten an — der Rest der Domäne bleibt unangetastet.
        </Step>
        <Step n="2" title="Geplanter HIBP-Abgleich">
          Ein Scheduled Task auf dem DC (oder einem Management-Host mit RSAT) fragt die HIBP-Konto-API ab und pflegt
          die Gruppenmitgliedschaft. Ohne API-Schlüssel arbeitet PwnWächter hier im Simulator mit einem lokalen Katalog.
        </Step>
        <Step n="3" title="Password Filter für geleakte Passwörter">
          PSOs können nicht prüfen, ob das neue Passwort selbst in Leaks steckt. Dafür ein LSA Notification Package
          (z. B. Lithnet Password Protection) mit lokalem HIBP-Hashkatalog.
        </Step>
      </ol>

      <div className="space-y-4">
        <ScriptBlock title="PSO anlegen" code={PS_CREATE_PSO} />
        <ScriptBlock title="HIBP-Abgleich (Scheduled Task)" code={PS_HIBP_SYNC} />
        <ScriptBlock title="Hinweis Password Filter" code={PS_PASSWORD_FILTER_NOTE} />
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-elevated font-mono text-xs text-steel">
        {n}
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted">{children}</p>
      </div>
    </li>
  );
}

function ScriptBlock({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card>
      <CardInner>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{title}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                toast.success("Kopiert.");
                setTimeout(() => setCopied(false), 1600);
              } catch {
                toast.error("Kopieren nicht möglich — Text markieren.");
              }
            }}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Kopiert" : "Kopieren"}
          </Button>
        </div>
        <pre className="max-h-80 overflow-auto rounded-md bg-bg p-4 font-mono text-[0.75rem] leading-relaxed text-fg whitespace-pre-wrap">
          {code}
        </pre>
      </CardInner>
    </Card>
  );
}
