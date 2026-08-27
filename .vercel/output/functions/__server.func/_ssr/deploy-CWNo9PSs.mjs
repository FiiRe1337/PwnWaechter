import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Copy, v as Check } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as Button } from "./router-Cd8d3wQ-.mjs";
import { n as CardInner, r as PageHeader, t as Card } from "./card-DJU3kCz1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deploy-CWNo9PSs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PS_CREATE_PSO = `# PwnWächter — Fine-Grained Password Policy für kompromittierte Identitäten
# Auf einem Domain Controller oder mit RSAT als Domain-Admin ausführen.

$GroupName = "PwnWaechter-Pwned"
$PSOName   = "PSO-PwnWaechter-Elevated"

if (-not (Get-ADGroup -Filter "Name -eq '$GroupName'" -ErrorAction SilentlyContinue)) {
  New-ADGroup -Name $GroupName -GroupScope Global -GroupCategory Security \`
    -Path "CN=Users,DC=adlerwerk,DC=local" \`
    -Description "Identitäten, die in Have I Been Pwned auftauchen. PSO greift automatisch."
}

New-ADFineGrainedPasswordPolicy -Name $PSOName \`
  -Precedence 10 \`
  -MinPasswordLength 16 \`
  -PasswordHistoryCount 24 \`
  -MinPasswordAge "1.00:00:00" \`
  -MaxPasswordAge "30.00:00:00" \`
  -LockoutDuration "00:30:00" \`
  -LockoutObservationWindow "00:30:00" \`
  -LockoutThreshold 5 \`
  -ComplexityEnabled $true \`
  -ReversibleEncryptionEnabled $false \`
  -ProtectedFromAccidentalDeletion $true

Add-ADFineGrainedPasswordPolicySubject -Identity $PSOName -Subjects $GroupName
Write-Host "PSO $PSOName ist mit Gruppe $GroupName verknüpft."
`;
var PS_HIBP_SYNC = `# PwnWächter — HIBP-Abgleich (geplanter Task, z. B. stündlich)
# Benötigt: HIBP-API-Schlüssel (https://haveibeenpwned.com/API/Key)
# Setzt Mitglieder der Gruppe PwnWaechter-Pwned anhand der HIBP-Kontoabfrage.

$ApiKey    = $env:HIBP_API_KEY
$GroupName = "PwnWaechter-Pwned"
$UserAgent = "PwnWaechter-DC/1.0"
$Headers   = @{ "hibp-api-key" = $ApiKey; "User-Agent" = $UserAgent }

$users = Get-ADUser -Filter {Enabled -eq $true} -Properties mail, userPrincipalName
$pwned = @()

foreach ($u in $users) {
  $account = if ($u.mail) { $u.mail } else { $u.userPrincipalName }
  if (-not $account) { continue }

  try {
    $uri = "https://haveibeenpwned.com/api/v3/breachedaccount/$([uri]::EscapeDataString($account))?truncateResponse=true"
    $null = Invoke-RestMethod -Uri $uri -Headers $Headers -Method Get
    $pwned += $u
    Write-Host "PWNED  $($u.SamAccountName)  $account"
  } catch [System.Net.WebException] {
    $resp = $_.Exception.Response
    if ($resp -and [int]$resp.StatusCode -eq 404) {
      Write-Host "CLEAN  $($u.SamAccountName)"
    } else {
      Write-Warning "Fehler bei $account : $_"
    }
  }
  Start-Sleep -Milliseconds 1600  # HIBP Rate-Limit
}

$group = Get-ADGroup $GroupName
$current = Get-ADGroupMember $group | Select-Object -ExpandProperty distinguishedName

foreach ($u in $pwned) {
  if ($current -notcontains $u.DistinguishedName) {
    Add-ADGroupMember -Identity $group -Members $u
  }
}
foreach ($dn in $current) {
  if ($pwned.DistinguishedName -notcontains $dn) {
    Remove-ADGroupMember -Identity $group -Members $dn -Confirm:$false
  }
}

Write-Host ("Fertig. {0} Identitäten in der erhöhten Richtlinie." -f $pwned.Count)
`;
var PS_PASSWORD_FILTER_NOTE = `# Pwned-Passwort-Filter auf dem Domain Controller
#
# Fine-Grained Password Policies können LÄNGE und Komplexität pro Gruppe
# erzwingen — aber NICHT, ob das neue Passwort in Have I Been Pwned steht.
# Dafür braucht der DC einen Password Filter (LSA Notification Package):
#
#   1. Lithnet Password Protection  (empfohlen, nutzt HIBP-Hashes lokal)
#      https://github.com/lithnet/ad-password-protection
#   2. Enzoic for Active Directory
#   3. Azure AD Password Protection (für Hybrid)
#
# PwnWächter orchestriert die identitätsbezogene Richtlinie (PSO) und prüft
# im Simulator beides: Name in HIBP → Richtlinie anheben, Passwort in HIBP → ablehnen.
#
# Nach Installation des nativen Filters:
#   HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\Notification Packages
# muss den Filternamen enthalten. Danach DC neu starten.
`;
function DeployPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Windows Server",
			title: "Bereitstellung",
			description: "Diese Konsole ist die Schaltzentrale und der Simulator. Auf einem echten Domain Controller übernimmt eine Fine-Grained Password Policy die erhöhten Anforderungen — und ein nativer Password Filter die Pwned-Passwort-Sperre."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
			className: "mb-6 space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
					n: "1",
					title: "Gruppe + PSO",
					children: "Konten, deren Name in Have I Been Pwned steht, kommen in die Gruppe PwnWaechter-Pwned. Die verknüpfte PSO hebt Länge, Komplexität und Höchstalter nur für diese Konten an — der Rest der Domäne bleibt unangetastet."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
					n: "2",
					title: "Geplanter HIBP-Abgleich",
					children: "Ein Scheduled Task auf dem DC (oder einem Management-Host mit RSAT) fragt die HIBP-Konto-API ab und pflegt die Gruppenmitgliedschaft. Ohne API-Schlüssel arbeitet PwnWächter hier im Simulator mit einem lokalen Katalog."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
					n: "3",
					title: "Password Filter für geleakte Passwörter",
					children: "PSOs können nicht prüfen, ob das neue Passwort selbst in Leaks steckt. Dafür ein LSA Notification Package (z. B. Lithnet Password Protection) mit lokalem HIBP-Hashkatalog."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScriptBlock, {
					title: "PSO anlegen",
					code: PS_CREATE_PSO
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScriptBlock, {
					title: "HIBP-Abgleich (Scheduled Task)",
					code: PS_HIBP_SYNC
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScriptBlock, {
					title: "Hinweis Password Filter",
					code: PS_PASSWORD_FILTER_NOTE
				})
			]
		})
	] });
}
function Step({ n, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-elevated font-mono text-xs text-steel",
			children: n
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children
		})] })]
	});
}
function ScriptBlock({ title, code }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardInner, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3 flex items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			onClick: async () => {
				try {
					await navigator.clipboard.writeText(code);
					setCopied(true);
					toast.success("Kopiert.");
					setTimeout(() => setCopied(false), 1600);
				} catch {
					toast.error("Kopieren nicht möglich — Text markieren.");
				}
			},
			children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? "Kopiert" : "Kopieren"]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: "max-h-80 overflow-auto rounded-md bg-bg p-4 font-mono text-[0.75rem] leading-relaxed text-fg whitespace-pre-wrap",
		children: code
	})] }) });
}
//#endregion
export { DeployPage as component };
