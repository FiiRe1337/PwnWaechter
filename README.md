# PwnWächter

Passwortfilter für Active Directory. Prüft **bevor** ein neues Kennwort gilt, ob der **Name** der Identität in [Have I Been Pwned](https://haveibeenpwned.com/) auftaucht. Ist das der Fall, gilt für genau dieses Konto eine **erhöhte Passwortrichtlinie**. Unabhängig davon werden Passwörter abgelehnt, die selbst in *Pwned Passwords* stehen.

Der Benutzer am Arbeitsplatz öffnet kein Extra-Tool. Er drückt `Strg + Alt + Entf` → **Kennwort ändern**. Der Domain Controller entscheidet.

## Warum

Die Standardrichtlinie der Domäne gilt für alle gleich. Ein Konto, das bereits in einem öffentlichen Leak steht, braucht aber strengere Regeln als ein unauffälliges Konto. PwnWächter trennt deshalb:

| Prüfung | Quelle | Folge |
| --- | --- | --- |
| Name / Mail / UPN in einem Leak | HIBP Konto-API oder lokaler Katalog | Fine-Grained Password Policy (erhöht) nur für dieses Konto |
| Neues Passwort in Leaks gesehen | HIBP Pwned Passwords (SHA-1, k-Anonymität) | Änderung wird abgelehnt |

Saubere Konten behalten die Basisrichtlinie der Domäne.

## So erlebt es der Benutzer

1. `Strg + Alt + Entf` am Windows-Rechner
2. **Kennwort ändern**
3. Altes und neues Kennwort eingeben

Kein Browser, keine HIBP-Seite, kein Hinweis „Dein Name steht in einem Leak“.

Der Domain Controller prüft die Änderung **bevor** sie geschrieben wird:

1. Konto auflösen (`sAMAccountName`, UPN, Mail)
2. Steht der Name in HIBP → Gruppe `PwnWaechter-Pwned` → erhöhte PSO
3. Neues Passwort gegen genau diese Richtlinie prüfen
4. Pwned-Passwort-Katalog prüfen
5. Nur bei Erfolg speichern

Bei Ablehnung zeigt Windows die übliche Meldung:

> Das Kennwort entspricht nicht den Anforderungen der Richtlinie.

Der Benutzer muss ein stärkeres Kennwort wählen. Den Grund sieht der Admin im Protokoll, nicht der Benutzer.

## Architektur

```
Arbeitsplatz                    Domain Controller
─────────────                   ─────────────────
Strg+Alt+Entf
Kennwort ändern  ────────────►  LSA
                                ├─ Fine-Grained Password Policy
                                │    Basis  = saubere Identität
                                │    Erhöht = Name in HIBP
                                │              (Gruppe PwnWaechter-Pwned)
                                └─ Password Filter (z. B. Lithnet)
                                     Pwned Passwords, lokaler Hashkatalog

Geplanter Task (stündlich)
  AD-Benutzer → HIBP Konto-API → Mitgliedschaft PwnWaechter-Pwned
```

Zwei Ebenen, weil Active Directory sie so trennt:

- **PSO** kann Länge, Komplexität, Höchstalter **pro Gruppe** erzwingen.
- **PSO kann nicht** prüfen, ob das neue Passwort in Have I Been Pwned steht. Dafür ein natives LSA Notification Package auf jedem DC.

Die Web-Konsole in diesem Repo ist Schaltzentrale und Simulator. Sie ersetzt den Filter auf dem DC nicht.

## Standardwerte der Richtlinien

Werte in der Konsole anpassbar. Vorschlag:

| Regel | Basis (sauber) | Erhöht (Name in HIBP) |
| --- | --- | --- |
| Mindestlänge | 12 | 16 |
| Zeichenklassen | 3 von 4 | 4 von 4 |
| Sonderzeichen | optional | Pflicht |
| Max. Kennwortalter | 90 Tage | 30 Tage |
| Verlauf | 24 | 24 |
| Kontoname / Anzeigename im Passwort | gesperrt | gesperrt |
| Tastaturfolgen, Wörterbuch | aus | an |
| Pwned Passwords | immer gesperrt | immer gesperrt |

## Repository

| Pfad | Inhalt |
| --- | --- |
| Konsole / Simulator | Web-Oberfläche: Passwortwechsel, Identitäten, Richtlinien, Protokoll |
| `deploy/New-PwnWaechterPso.ps1` | Gruppe + Fine-Grained Password Policy anlegen |
| `deploy/Sync-HibpIdentities.ps1` | Geplanter Task: HIBP-Abgleich, Gruppenmitgliedschaft |
| `deploy/PasswordFilter.hint.ps1` | Hinweis zur Installation eines nativen Password Filters |

Skriptnamen an eure tatsächliche Ordnerstruktur anpassen, falls ihr sie anders ablegt.

## Voraussetzungen (Produktion)

- Windows Server mit Active Directory (Functional Level 2012 R2 oder neuer für PSO)
- Rechte als Domain-Admin bzw. für Fine-Grained Password Policies
- RSAT / `ActiveDirectory`-PowerShell-Modul
- [HIBP-API-Schlüssel](https://haveibeenpwned.com/API/Key) für den Konto-Abgleich
- Optional, aber empfohlen: [Lithnet Password Protection](https://github.com/lithnet/ad-password-protection) oder ein vergleichbarer Filter für Pwned Passwords

Pwned Passwords selbst braucht **keinen** API-Schlüssel. Die Abfrage sendet nur die ersten fünf Zeichen des SHA-1-Hashs (k-Anonymität), nie das Klartext-Passwort.

## Installation auf dem Domain Controller

### 1. Gruppe und PSO

Als Domain-Admin:

```powershell
# Beispiel — Pfad und Domäne anpassen
.\deploy\New-PwnWaechterPso.ps1
```

Das Skript legt an:

- Sicherheitsgruppe `PwnWaechter-Pwned`
- Fine-Grained Password Policy `PSO-PwnWaechter-Elevated` (Precedence 10)
- Verknüpfung der PSO mit der Gruppe

Konten in dieser Gruppe unterliegen sofort der erhöhten Richtlinie. Der Rest der Domäne bleibt unangetastet.

### 2. HIBP-Abgleich als geplanter Task

```powershell
$env:HIBP_API_KEY = "…"   # nicht ins Repo legen
.\deploy\Sync-HibpIdentities.ps1
```

Der Lauf:

1. Liest aktivierte Benutzer (`mail`, sonst UPN)
2. Fragt die HIBP-Konto-API (Rate-Limit beachten, Pause zwischen Calls)
3. Nimmt getroffene Konten in `PwnWaechter-Pwned` auf
4. Entfernt Konten, die nicht mehr auftauchen

Als Scheduled Task auf einem DC oder einem Management-Host mit RSAT, z. B. stündlich, Konto mit Leserechten auf Benutzer und Schreibrechten auf die Gruppe. API-Schlüssel nur in der Task-Umgebung oder im Credential Store, nicht in der Skriptdatei.

Ohne Schlüssel arbeitet nur der Simulator mit einem lokalen Katalog.

### 3. Password Filter für geleakte Passwörter

Fine-Grained Policies prüfen keine Leak-Datenbanken. Dafür auf **jedem** Domain Controller ein LSA Notification Package, zum Beispiel Lithnet Password Protection mit lokalem HIBP-Hashkatalog.

Nach der Installation muss der Filtername unter

`HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Notification Packages`

stehen. Danach den DC kontrolliert neu starten. Filter auf allen DCs gleich halten, sonst hängt das Ergebnis davon ab, welcher DC die Änderung annimmt.

Hybrid / Entra ID: zusätzlich [Microsoft Entra Password Protection](https://learn.microsoft.com/entra/identity/authentication/concept-password-ban-bad) prüfen.

## Simulator / Konsole

Die Oberfläche dient zum Nachvollziehen der Filter-Pipeline und zum Pflegen von Demo-Identitäten und Richtlinien.

Typischer Test:

1. **Passwortwechsel** öffnen
2. Konto wählen, das in HIBP steht → Anforderung springt auf **erhöht**
3. Schwaches Kennwort senden → Ablehnung, inkl. Pwned-Hits
4. Sauberes Konto + langes, einzigartiges Kennwort → Zulassung
5. Entscheidung erscheint unter **Protokoll**

Ein HIBP-API-Schlüssel in den Richtlinien ist optional. Ohne Schlüssel gilt der lokale Leak-Katalog der Demo. Pwned Passwords läuft live gegen `api.pwnedpasswords.com`.

## Datenschutz

- Pwned Passwords: nur SHA-1-Präfix (5 Hex-Zeichen) verlässt den Rechner.
- Konto-API: Mail oder UPN gehen an Have I Been Pwned. Dafür braucht ihr einen Vertrag / eine interne Freigabe und den API-Schlüssel.
- Keine Klartext-Passwörter loggen.
- API-Schlüssel nicht committen.

## Betrieb

- HIBP-Sync überwachen (Task-Last, 429, abgelehnte Schlüssel).
- Gruppenmitgliedschaft stichprobenartig gegen HIBP halten.
- PSO-Precedence prüfen, falls mehrere Fine-Grained Policies existieren (niedrigere Zahl gewinnt).
- Password Filter nach DC-Patchstand und Hashkatalog-Aktualisierung kontrollieren.
- Filter-Ausfall bedeutet: PSO gilt weiter, Pwned-Passwort-Sperre nicht.

## Grenzen

- Windows zeigt dem Benutzer keine HIBP-Begründung.
- Live-Abfrage jedes Namens im Augenblick der Änderung ist auf dem DC ungeeignet ( Latenz, Rate-Limit, Abhängigkeit vom Internet). Deshalb der geplante Sync in die AD-Gruppe.
- Funktioniert nur für **Domain-Benutzer**. Lokale SAM-Konten gehen nicht über diesen Filter.
- Kein Ersatz für MFA, Conditional Access oder ein PAM-Konzept für privilegierte Konten.

## Lizenz

Nutzung im eigenen Unternehmen. Have I Been Pwned unterliegt den Bedingungen von Troy Hunt / haveibeenpwned.com. Lithnet und Microsoft-Komponenten unterliegen deren Lizenzen.
